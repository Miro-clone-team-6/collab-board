import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { sameElement, sortElements, stickerId } from "./elements";
import { createFileSync } from "./files";
import { createRevisionState } from "./revisions";
import { createTransport } from "./transport";
import type { BoardConnectionStatus, ServerMessage } from "./types";

const SEND_INTERVAL = 60;

export function connectExcalidrawRoom(
  api: ExcalidrawImperativeAPI,
  setConnection: (status: BoardConnectionStatus) => void,
) {
  let ready = false;
  let hasSnapshot = false;
  let sendTimer: ReturnType<typeof setTimeout> | undefined;

  const fileSync = createFileSync(api);
  const revisionState = createRevisionState();

  const transport = createTransport({
    onMessage: applyMessage,
    onReconnect: handleReconnect,
  });

  function readDrafts() {
    const expected = revisionState.expectedElements();
    return api
      .getSceneElementsIncludingDeleted()
      .filter((element) => !sameElement(element, expected.get(element.id)));
  }

  function render(drafts: readonly ExcalidrawElement[] = []) {
    const expected = revisionState.expectedElements();
    for (const element of drafts) expected.set(element.id, element);

    const current = api.getSceneElementsIncludingDeleted();
    const byId = new Map(current.map((element) => [element.id, element]));
    const elements = [...expected.values()].sort(sortElements).map((element) => {
      const existing = byId.get(element.id);
      return existing && sameElement(existing, element) ? existing : structuredClone(element);
    });
    if (
      elements.length !== current.length ||
      elements.some((element, i) => element !== current[i])
    ) {
      api.updateScene({ elements, captureUpdate: CaptureUpdateAction.NEVER });
    }
  }

  function send(
    elements: readonly ExcalidrawElement[],
    files: BinaryFiles,
    retriedDeletion = false,
  ) {
    const changes = revisionState.preparePatch(elements, retriedDeletion);

    transport.send({
      event: "patch",
      data: { changes, files },
    });

    setConnection("syncing");
    transport.waitForResponse();
  }

  function scheduleSend() {
    if (!ready || revisionState.hasPending() || sendTimer !== undefined) return;
    sendTimer = setTimeout(() => {
      sendTimer = undefined;
      if (!ready || revisionState.hasPending() || !transport.isOpen()) return;
      const drafts = readDrafts();
      const first = drafts[0];
      // Конфликт одного стикера не должен откатывать изменения другого.
      const elements = first ? drafts.filter((draft) => stickerId(draft) === stickerId(first)) : [];
      const files = fileSync.getFilesToSend([...elements, ...revisionState.getConfirmedElements()]);
      if (elements.length || Object.keys(files).length) send(elements, files);
    }, SEND_INTERVAL);
  }

  function applyMessage(message: ServerMessage) {
    if (message.event === "snapshot") {
      transport.clearResponseTimeout();

      fileSync.reset();

      revisionState.applySnapshot(message.data.elements);

      fileSync.applyFiles(message.data.files);
      render();
      if (hasSnapshot) api.history.clear();

      hasSnapshot = true;
      ready = true;
      setConnection("connected");
      return;
    }

    const drafts = readDrafts();
    const own = message.event === "patch" && (message.data.own ?? false);
    const incomingIds = revisionState.applyIncomingElements(message.data.elements, own);

    if (message.event === "patch") {
      fileSync.applyFiles(message.data.files);
      if (own) {
        transport.clearResponseTimeout();
        revisionState.clearPending();
        setConnection("connected");
      }
    }

    // Входящая правка может убрать локальный результат Undo до отказа сервера в удалении.
    revisionState.reconcileDeletionRetry(drafts, incomingIds, message.event === "conflict");

    // Если входящая правка затронула ожидающее отправки удаление, применяем его к новой версии.
    const remaining = revisionState.reconcileDrafts(drafts, incomingIds);

    if (message.event === "conflict") {
      transport.clearResponseTimeout();

      const deletions = revisionState.rejectPendingPatch();

      if (deletions.length) send(deletions, {}, true);
      else setConnection("conflict");
    }

    render(remaining);
    scheduleSend();
  }

  function handleReconnect() {
    ready = false;
    revisionState.clearPending();

    clearTimeout(sendTimer);
    sendTimer = undefined;

    setConnection("reconnecting");
  }

  const unsubscribe = api.onChange(scheduleSend);
  transport.connect();
  return () => {
    unsubscribe();
    clearTimeout(sendTimer);
    transport.dispose();
  };
}

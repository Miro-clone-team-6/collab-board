import { CaptureUpdateAction, newElementWith } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type VersionedElement = { element: ExcalidrawElement; revision: number };
type Change = { element: ExcalidrawElement; baseRevision: number | null };
type PendingPatch = { changes: Change[]; retryDeletion: boolean };
type ServerMessage =
  | { event: "snapshot"; data: { elements: VersionedElement[]; files: BinaryFiles } }
  | { event: "patch"; data: { elements: VersionedElement[]; files: BinaryFiles; own?: true } }
  | { event: "conflict"; data: { elements: VersionedElement[] } };

const CONNECTED = "WebSocket: общая тестовая комната подключена";
const SEND_INTERVAL = 60;
const RECONNECT_DELAY = 500;
const RESPONSE_TIMEOUT = 5_000;

function sameElement(left: ExcalidrawElement, right?: ExcalidrawElement) {
  return (
    left.id === right?.id &&
    left.version === right.version &&
    left.versionNonce === right.versionNonce &&
    left.isDeleted === right.isDeleted
  );
}

function sortElements(left: ExcalidrawElement, right: ExcalidrawElement) {
  const leftIndex = left.index ?? "";
  const rightIndex = right.index ?? "";
  if (leftIndex !== rightIndex) return leftIndex < rightIndex ? -1 : 1;
  return left.id === right.id ? 0 : left.id < right.id ? -1 : 1;
}

function touchesSticker(element: ExcalidrawElement, ids: Set<string>) {
  return (
    ids.has(element.id) ||
    (element.type === "text" && element.containerId !== null && ids.has(element.containerId)) ||
    element.boundElements?.some((binding) => binding.type === "text" && ids.has(binding.id))
  );
}

function stickerId(element: ExcalidrawElement) {
  return element.type === "text" ? (element.containerId ?? element.id) : element.id;
}

export function connectExcalidrawRoom(
  api: ExcalidrawImperativeAPI,
  setConnection: (message: string) => void,
) {
  const url = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/board-sync";
  url.search = "";
  url.hash = "";

  const confirmed = new Map<string, VersionedElement>();
  const knownFiles = new Set<string>();
  let socket: WebSocket;
  let pending: PendingPatch | undefined;
  let ready = false;
  let hasSnapshot = false;
  let sendTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let responseTimer: ReturnType<typeof setTimeout> | undefined;

  function expectedElements() {
    const elements = new Map([...confirmed].map(([id, entry]) => [id, entry.element]));
    // Пока удаление можно повторить, элемент остаётся скрытым.
    if (
      pending &&
      (pending.retryDeletion ||
        pending.changes.every(
          ({ element, baseRevision }) =>
            (confirmed.get(element.id)?.revision ?? null) === baseRevision,
        ))
    ) {
      for (const { element } of pending.changes) elements.set(element.id, element);
    }
    return elements;
  }

  function readDrafts() {
    const expected = expectedElements();
    return api
      .getSceneElementsIncludingDeleted()
      .filter((element) => !sameElement(element, expected.get(element.id)));
  }

  function render(drafts: readonly ExcalidrawElement[] = []) {
    const expected = expectedElements();
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
    const changes = elements.map((element) => ({
      element: structuredClone(element),
      baseRevision: confirmed.get(element.id)?.revision ?? null,
    }));
    pending = {
      changes,
      retryDeletion:
        !retriedDeletion && changes.length > 0 && changes.every(({ element }) => element.isDeleted),
    };
    socket.send(JSON.stringify({ event: "patch", data: { changes, files } }));
    setConnection("WebSocket: ожидание подтверждения правок…");
    waitForResponse("WebSocket: сервер не подтвердил правки. Восстановление соединения…");
  }

  function scheduleSend() {
    if (!ready || pending || sendTimer !== undefined) return;
    sendTimer = setTimeout(() => {
      sendTimer = undefined;
      if (!ready || pending || socket.readyState !== WebSocket.OPEN) return;
      const drafts = readDrafts();
      const first = drafts[0];
      // Конфликт одного стикера не должен откатывать изменения другого.
      const elements = first ? drafts.filter((draft) => stickerId(draft) === stickerId(first)) : [];
      const referencedFiles = new Set<string>(
        [...elements, ...Array.from(confirmed.values(), ({ element }) => element)].flatMap(
          (element) =>
            element.type === "image" && !element.isDeleted && element.fileId
              ? [element.fileId]
              : [],
        ),
      );
      const files = Object.fromEntries(
        Object.entries(api.getFiles()).filter(
          ([id]) => referencedFiles.has(id) && !knownFiles.has(id),
        ),
      );
      if (elements.length || Object.keys(files).length) send(elements, files);
    }, SEND_INTERVAL);
  }

  function applyMessage(message: ServerMessage) {
    if (message.event === "snapshot") {
      clearTimeout(responseTimer);
      confirmed.clear();
      knownFiles.clear();
      for (const entry of message.data.elements) confirmed.set(entry.element.id, entry);
      api.addFiles(Object.values(message.data.files));
      for (const id of Object.keys(message.data.files)) knownFiles.add(id);
      render();
      if (hasSnapshot) api.history.clear();
      hasSnapshot = true;
      ready = true;
      setConnection(CONNECTED);
      return;
    }

    const drafts = readDrafts();
    const own = message.event === "patch" && message.data.own;
    const incomingIds = new Set<string>();
    for (const entry of message.data.elements) {
      const id = entry.element.id;
      if (!own && confirmed.get(id)?.revision !== entry.revision) incomingIds.add(id);
      confirmed.set(id, entry);
    }

    if (message.event === "patch") {
      api.addFiles(Object.values(message.data.files));
      for (const id of Object.keys(message.data.files)) knownFiles.add(id);
      if (own) {
        clearTimeout(responseTimer);
        pending = undefined;
        setConnection(CONNECTED);
      }
    }

    // Входящая правка может убрать локальный результат Undo до отказа сервера в удалении.
    if (
      pending?.retryDeletion &&
      pending.changes.some(({ element }) =>
        drafts.some(
          (draft) =>
            draft.id === element.id &&
            !draft.isDeleted &&
            (message.event === "conflict" || touchesSticker(draft, incomingIds)),
        ),
      )
    ) {
      pending.retryDeletion = false;
    }

    // Если входящая правка затронула ожидающее отправки удаление, применяем его к новой версии.
    const remaining: ExcalidrawElement[] = [];
    for (const element of drafts) {
      if (!touchesSticker(element, incomingIds)) {
        remaining.push(element);
      } else if (element.isDeleted) {
        const current = confirmed.get(element.id)?.element;
        if (current && !current.isDeleted)
          remaining.push(newElementWith(current, { isDeleted: true }));
      }
    }

    if (message.event === "conflict") {
      clearTimeout(responseTimer);
      const rejected = pending;
      pending = undefined;
      const deletions = rejected?.retryDeletion
        ? rejected.changes.flatMap(({ element }) => {
            const current = confirmed.get(element.id)?.element;
            return current && !current.isDeleted
              ? [newElementWith(current, { isDeleted: true })]
              : [];
          })
        : [];
      if (deletions.length) send(deletions, {}, true);
      else setConnection("WebSocket: конфликт правок. Показано состояние сервера.");
    }

    render(remaining);
    scheduleSend();
  }

  function closeSocket() {
    socket.onclose = null;
    socket.onmessage = null;
    socket.close();
  }

  function reconnect(message: string) {
    ready = false;
    pending = undefined;
    clearTimeout(sendTimer);
    sendTimer = undefined;
    clearTimeout(responseTimer);
    closeSocket();
    setConnection(message);
    reconnectTimer = setTimeout(connect, RECONNECT_DELAY);
  }

  function waitForResponse(message: string) {
    responseTimer = setTimeout(() => reconnect(message), RESPONSE_TIMEOUT);
  }

  function connect() {
    socket = new WebSocket(url);
    socket.onmessage = (event) => applyMessage(JSON.parse(event.data) as ServerMessage);
    socket.onclose = () =>
      reconnect("WebSocket отключён. Переподключение… Локальные правки будут сброшены.");
    waitForResponse("WebSocket: снимок комнаты не получен. Восстановление соединения…");
  }

  const unsubscribe = api.onChange(scheduleSend);
  connect();
  return () => {
    unsubscribe();
    clearTimeout(sendTimer);
    clearTimeout(reconnectTimer);
    clearTimeout(responseTimer);
    closeSocket();
  };
}

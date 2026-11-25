import { newElementWith } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { touchesSticker } from "./elements";
import type { Change, PendingPatch, VersionedElement } from "./types";

export function createRevisionState() {
  const confirmed = new Map<string, VersionedElement>();
  let pending: PendingPatch | undefined;

  function expectedElements() {
    const elements = new Map([...confirmed].map(([id, entry]) => [id, entry.element]));

    if (
      pending &&
      (pending.retryDeletion ||
        pending.changes.every(
          ({ element, baseRevision }) =>
            (confirmed.get(element.id)?.revision ?? null) === baseRevision,
        ))
    ) {
      for (const { element } of pending.changes) {
        elements.set(element.id, element);
      }
    }

    return elements;
  }

  function clearPending(): void {
    pending = undefined;
  }

  function hasPending(): boolean {
    return pending !== undefined;
  }

  function cancelDeletionRetry(): void {
    if (pending) {
      pending.retryDeletion = false;
    }
  }

  function getConfirmedElements(): ExcalidrawElement[] {
    return Array.from(confirmed.values(), ({ element }) => element);
  }

  function preparePatch(elements: readonly ExcalidrawElement[], retriedDeletion = false): Change[] {
    const changes = elements.map((element) => ({
      element: structuredClone(element),
      baseRevision: confirmed.get(element.id)?.revision ?? null,
    }));

    pending = {
      changes,
      retryDeletion:
        !retriedDeletion && changes.length > 0 && changes.every(({ element }) => element.isDeleted),
    };
    return changes;
  }

  function applyIncomingElements(entries: readonly VersionedElement[], own: boolean): Set<string> {
    const incomingIds = new Set<string>();

    for (const entry of entries) {
      const id = entry.element.id;
      if (!own && confirmed.get(id)?.revision !== entry.revision) incomingIds.add(id);
      confirmed.set(entry.element.id, entry);
    }
    return incomingIds;
  }

  function applySnapshot(entries: readonly VersionedElement[]): void {
    confirmed.clear();

    for (const entry of entries) {
      confirmed.set(entry.element.id, entry);
    }
  }

  function reconcileDeletionRetry(
    drafts: readonly ExcalidrawElement[],
    incomingIds: Set<string>,
    isConflict: boolean,
  ): void {
    if (
      pending?.retryDeletion &&
      pending.changes.some(({ element }) =>
        drafts.some(
          (draft) =>
            draft.id === element.id &&
            !draft.isDeleted &&
            (isConflict || touchesSticker(draft, incomingIds)),
        ),
      )
    ) {
      cancelDeletionRetry();
    }
  }

  function reconcileDrafts(
    drafts: readonly ExcalidrawElement[],
    incomingIds: Set<string>,
  ): ExcalidrawElement[] {
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

    return remaining;
  }

  function rejectPendingPatch(): ExcalidrawElement[] {
    const rejected = pending;
    pending = undefined;

    return rejected?.retryDeletion
      ? rejected.changes.flatMap(({ element }) => {
          const current = confirmed.get(element.id)?.element;
          return current && !current.isDeleted
            ? [newElementWith(current, { isDeleted: true })]
            : [];
        })
      : [];
  }

  return {
    expectedElements,
    clearPending,
    hasPending,
    getConfirmedElements,
    preparePatch,
    applyIncomingElements,
    applySnapshot,
    reconcileDeletionRetry,
    reconcileDrafts,
    rejectPendingPatch,
  };
}

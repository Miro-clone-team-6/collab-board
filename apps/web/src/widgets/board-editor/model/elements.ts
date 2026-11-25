import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
export function sameElement(left: ExcalidrawElement, right?: ExcalidrawElement): boolean {
  return (
    left.id === right?.id &&
    left.version === right.version &&
    left.versionNonce === right.versionNonce &&
    left.isDeleted === right.isDeleted
  );
}

export function sortElements(left: ExcalidrawElement, right: ExcalidrawElement): number {
  const leftIndex = left.index ?? "";
  const rightIndex = right.index ?? "";
  if (leftIndex !== rightIndex) return leftIndex < rightIndex ? -1 : 1;
  return left.id === right.id ? 0 : left.id < right.id ? -1 : 1;
}

export function touchesSticker(element: ExcalidrawElement, ids: Set<string>): boolean {
  return (
    ids.has(element.id) ||
    (element.type === "text" && element.containerId !== null && ids.has(element.containerId)) ||
    (element.boundElements?.some((binding) => binding.type === "text" && ids.has(binding.id)) ??
      false)
  );
}

export function stickerId(element: ExcalidrawElement): string {
  return element.type === "text" ? (element.containerId ?? element.id) : element.id;
}

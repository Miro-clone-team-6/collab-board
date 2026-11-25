import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

export function createFileSync(api: ExcalidrawImperativeAPI) {
  const knownFiles = new Set<string>();

  function reset(): void {
    knownFiles.clear();
  }

  function applyFiles(files: BinaryFiles): void {
    api.addFiles(Object.values(files));
    for (const id of Object.keys(files)) knownFiles.add(id);
  }

  function getFilesToSend(elements: readonly ExcalidrawElement[]): BinaryFiles {
    const referencedFiles = new Set<string>(
      elements.flatMap((element) =>
        element.type === "image" && !element.isDeleted && element.fileId ? [element.fileId] : [],
      ),
    );

    return Object.fromEntries(
      Object.entries(api.getFiles()).filter(
        ([id]) => referencedFiles.has(id) && !knownFiles.has(id),
      ),
    );
  }

  return {
    reset,
    applyFiles,
    getFilesToSend,
  };
}

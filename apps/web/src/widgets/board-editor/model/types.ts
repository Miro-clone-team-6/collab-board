import { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { BinaryFiles } from "@excalidraw/excalidraw/types";

export type VersionedElement = { element: ExcalidrawElement; revision: number };
export type Change = { element: ExcalidrawElement; baseRevision: number | null };
export type PendingPatch = { changes: Change[]; retryDeletion: boolean };
export type ServerMessage =
  | { event: "snapshot"; data: { elements: VersionedElement[]; files: BinaryFiles } }
  | { event: "patch"; data: { elements: VersionedElement[]; files: BinaryFiles; own?: true } }
  | { event: "conflict"; data: { elements: VersionedElement[] } };

export type BoardConnectionStatus =
  | "connecting"
  | "connected"
  | "syncing"
  | "reconnecting"
  | "conflict";

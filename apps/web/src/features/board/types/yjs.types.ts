// apps/web/src/features/board/types/yjs.types.ts

export interface YShapeData {
  type: "rect" | "circle" | "text" | "sticky" | "comment" | "group";
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  color?: string;
  author?: string;
  children?: string[];
  scaleX?: number;
  scaleY?: number;
}

export interface YConnectionData {
  id: string;
  type: "arrow";
  fromId: string;
  toId: string;
  color: string;
  strokeWidth: number;
}

export interface AwarenessUser {
  id: string;
  name: string;
  color: string;
}

export interface AwarenessState {
  user?: AwarenessUser;
  cursor?: { x: number; y: number };
}

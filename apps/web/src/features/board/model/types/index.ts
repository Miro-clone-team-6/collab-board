// src/features/board/types/index.ts

// Базовые свойства для всех фигур
export interface BaseShape {
  id: string;
  x: number;
  y: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation?: number;
}

// Прямоугольник
export interface RectShape extends BaseShape {
  type: "rect";
  width: number;
  height: number;
  cornerRadius?: number;
}

// Круг
export interface CircleShape extends BaseShape {
  type: "circle";
  radius: number;
}

// Текст
export interface TextShape extends BaseShape {
  type: "text";
  text: string;
  fontSize: number;
  width: number;
  fontFamily?: string;
}

// Стикеры (текст на цветном фоне)
export interface StickyShape extends BaseShape {
  type: "sticky";
  text: string;
  width: number;
  height: number;
  color: string;
}

// Изображения
export interface ImageShape extends BaseShape {
  type: "image";
  src: string;
  width: number;
  height: number;
}

// Комментарии
export interface CommentShape {
  id: string;
  type: "comment";
  x: number;
  y: number;
  text: string;
  author: string;
}

// Группы
export interface GroupShape {
  id: string;
  type: "group";
  x: number;
  y: number;
  rotation: number;
  scaleX?: number;
  scaleY?: number;
  children: Shape[];
}

// Union всех типов фигур
export type Shape =
  | RectShape
  | CircleShape
  | TextShape
  | StickyShape
  | ImageShape
  | GroupShape
  | CommentShape;

// Соединения (стрелки)
export interface Connection {
  id: string;
  type: "arrow";
  fromId: string;
  toId: string;
  color: string;
  strokeWidth: number;
  label?: string;
}

// Типы инструментов
export type ToolType =
  | "select"
  | "rect"
  | "circle"
  | "text"
  | "sticky"
  | "image"
  | "arrow"
  | "comment";

// Курсоры других пользователей (для realtime)
export interface Cursor {
  id: string;
  x: number;
  y: number;
  color: string;
  userName: string;
}

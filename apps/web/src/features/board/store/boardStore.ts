// src/features/board/store/boardStore.ts

import { nanoid } from "nanoid";
import { create } from "zustand";
import type { Connection, Cursor, Shape, ToolType } from "../types";

interface BoardState {
  // Состояние
  shapes: Shape[];
  connections: Connection[];
  selectedIds: string[];
  tool: ToolType;
  draftShape: Shape | null;
  cursors: Cursor[];
  openComments: string[];

  // Действия для фигур
  addShape: (shape: Shape) => void;
  updateShape: (id: string, patch: Partial<Shape>) => void;
  removeShape: (id: string) => void;

  // Действия для соединений
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;

  // Действия для выделения
  selectShape: (id: string | null) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;

  // Действия для инструментов
  setTool: (tool: ToolType) => void;
  setDraftShape: (shape: Shape | null) => void;
  updateDraftShape: (patch: Partial<Shape>) => void;

  // Действия для группировки
  groupSelected: () => void;
  ungroup: (groupId: string) => void;

  // Действия для курсоров
  updateCursor: (cursor: Cursor) => void;
  removeCursor: (id: string) => void;

  // Действия для комментариев
  toggleComment: (id: string) => void;
  closeComment: (id: string) => void;

  // Действия для рисования стрелок
  drawingArrow: { fromId: string; toX: number; toY: number } | null;
  startDrawingArrow: (fromId: string, x: number, y: number) => void;
  updateDrawingArrow: (toX: number, toY: number) => void;
  cancelDrawingArrow: () => void;
}

export const useBoardStore = create<BoardState>((set, _get) => ({
  // === НАЧАЛЬНОЕ СОСТОЯНИЕ ===
  shapes: [],
  connections: [],
  selectedIds: [],
  tool: "select",
  draftShape: null,
  cursors: [],
  openComments: [],
  drawingArrow: null,

  // === ФИГУРЫ ===
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),

  updateShape: (id, patch) =>
    set((state) => ({
      shapes: state.shapes.map((s) => (s.id === id ? ({ ...s, ...patch } as Shape) : s)),
    })),

  removeShape: (id) =>
    set((state) => ({
      shapes: state.shapes.filter((s) => s.id !== id),
      connections: state.connections.filter((c) => c.fromId !== id && c.toId !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    })),

  // === СОЕДИНЕНИЯ ===
  addConnection: (conn) => set((state) => ({ connections: [...state.connections, conn] })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),

  // === ВЫДЕЛЕНИЕ ===
  selectShape: (id) => set({ selectedIds: id ? [id] : [] }),

  selectMultiple: (ids) => set({ selectedIds: ids }),

  clearSelection: () => set({ selectedIds: [] }),

  // === ИНСТРУМЕНТЫ ===
  setTool: (tool) => set({ tool, selectedIds: [], draftShape: null }),

  setDraftShape: (shape) => set({ draftShape: shape }),

  updateDraftShape: (patch) =>
    set((state) => ({
      draftShape: state.draftShape ? ({ ...state.draftShape, ...patch } as Shape) : null,
    })),

  // === ГРУППИРОВКА (ИСПРАВЛЕНО: children принимает Shape[], а не string[]) ===
  groupSelected: () =>
    set((state) => {
      if (state.selectedIds.length < 2) return state;

      // 1. Находим выбранные фигуры (это уже массив объектов Shape[])
      const childrenShapes = state.shapes.filter((s) => state.selectedIds.includes(s.id));

      // 2. Создаем новую группу. Передаем сами объекты в children
      const newGroup: Shape = {
        id: nanoid(),
        type: "group",
        x: Math.min(...childrenShapes.map((c) => c.x)),
        y: Math.min(...childrenShapes.map((c) => c.y)),
        children: childrenShapes, // ✅ Передаем массив объектов Shape[], а не string[]
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
        rotation: 0,
        width: 0, // Добавляем на всякий случай, если BaseShape этого требует
        height: 0,
      } as Shape;

      // 3. Оставляем только те фигуры, которые НЕ вошли в группу
      const remainingShapes = state.shapes.filter((s) => !state.selectedIds.includes(s.id));

      // 4. Возвращаем новое состояние
      return {
        shapes: [...remainingShapes, newGroup],
        selectedIds: [newGroup.id],
      };
    }),

  ungroup: (groupId) =>
    set((state) => {
      const group = state.shapes.find((s) => s.id === groupId) as any;
      if (group?.type !== "group") return state;

      // Делаем координаты детей снова абсолютными
      const absoluteChildren = group.children.map((child: any) => ({
        ...child,
        x: child.x + group.x,
        y: child.y + group.y,
      }));

      return {
        shapes: [
          // <-- ИСПРАВЛЕНО: удаляем только саму группу, сохраняя все остальные фигуры на холсте
          ...state.shapes.filter((s) => s.id !== groupId),
          ...absoluteChildren, // Возвращаем детей на холст
        ],
        selectedIds: absoluteChildren.map((c: any) => c.id),
      };
    }),

  // === КУРСОРЫ ===
  updateCursor: (cursor) =>
    set((state) => {
      const existing = state.cursors.findIndex((c) => c.id === cursor.id);
      if (existing >= 0) {
        const newCursors = [...state.cursors];
        newCursors[existing] = cursor;
        return { cursors: newCursors };
      }
      return { cursors: [...state.cursors, cursor] };
    }),

  removeCursor: (id) =>
    set((state) => ({
      cursors: state.cursors.filter((c) => c.id !== id),
    })),

  // === КОММЕНТАРИИ ===
  toggleComment: (id) =>
    set((state) => ({
      openComments: state.openComments.includes(id)
        ? state.openComments.filter((cid) => cid !== id)
        : [...state.openComments, id],
    })),

  closeComment: (id) =>
    set((state) => ({
      openComments: state.openComments.filter((cid) => cid !== id),
    })),

  // === СТРЕЛКИ ===
  startDrawingArrow: (fromId, x, y) => set({ drawingArrow: { fromId, toX: x, toY: y } }),

  updateDrawingArrow: (toX, toY) =>
    set((state) => ({
      drawingArrow: state.drawingArrow ? { ...state.drawingArrow, toX, toY } : null,
    })),

  cancelDrawingArrow: () => set({ drawingArrow: null }),
}));

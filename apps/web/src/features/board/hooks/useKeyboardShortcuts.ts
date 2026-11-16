// src/features/board/hooks/useKeyboardShortcuts.ts

import { useEffect } from "react";
import { useBoardStore } from "../store/boardStore";

export function useKeyboardShortcuts() {
  const selectedIds = useBoardStore((s) => s.selectedIds);
  const removeShape = useBoardStore((s) => s.removeShape);
  const groupSelected = useBoardStore((s) => s.groupSelected);
  const clearSelection = useBoardStore((s) => s.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        selectedIds.forEach((id) => {
          removeShape(id);
        });
      }

      // Ctrl+G — группировка
      if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        groupSelected();
      }

      // Escape
      if (e.key === "Escape") {
        clearSelection();
        useBoardStore.getState().setTool("select");
      }

      // Переключение инструментов
      if (e.key === "v" || e.key === "V") useBoardStore.getState().setTool("select");
      if (e.key === "r" || e.key === "R") useBoardStore.getState().setTool("rect");
      if (e.key === "c" || e.key === "C") useBoardStore.getState().setTool("circle");
      if (e.key === "t" || e.key === "T") useBoardStore.getState().setTool("text");
      if (e.key === "s" || e.key === "S") useBoardStore.getState().setTool("sticky");
      if (e.key === "a" || e.key === "A") useBoardStore.getState().setTool("arrow");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, removeShape, groupSelected, clearSelection]);
}

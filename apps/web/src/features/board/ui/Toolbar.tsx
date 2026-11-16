// src/features/board/ui/Toolbar.tsx

"use client";

import React from "react";
import { useBoardStore } from "../store/boardStore";
import type { ToolType } from "../types";

const TOOLS: { id: ToolType; icon: string; label: string }[] = [
  { id: "select", icon: "🖱️", label: "Выделение (V)" },
  { id: "rect", icon: "▭", label: "Прямоугольник (R)" },
  { id: "circle", icon: "◯", label: "Круг (C)" },
  { id: "text", icon: "T", label: "Текст (T)" },
  { id: "sticky", icon: "📝", label: "Стикер (S)" },
  { id: "arrow", icon: "→", label: "Стрелка (A)" },
  { id: "comment", icon: "💬", label: "Комментарий" },
];

export const Toolbar: React.FC = () => {
  const tool = useBoardStore((s) => s.tool);
  const setTool = useBoardStore((s) => s.setTool);
  const groupSelected = useBoardStore((s) => s.groupSelected);
  const ungroup = useBoardStore((s) => s.ungroup); // <-- ДОБАВЛЕНО

  const selectedIds = useBoardStore((s) => s.selectedIds);
  const shapes = useBoardStore((s) => s.shapes); // <-- ДОБАВЛЕНО

  // Проверяем, является ли единственный выделенный элемент группой
  const selectedShape = shapes.find((s) => s.id === selectedIds[0]);
  const isGroupSelected = selectedIds.length === 1 && selectedShape?.type === "group";

  const handleExport = () => {
    window.dispatchEvent(new CustomEvent("export-whiteboard"));
  };

  return (
    <div className="flex gap-2 p-3 bg-white border-b border-gray-200 shadow-sm">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg text-lg
            transition-colors border
            ${
              tool === t.id
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-px bg-gray-300 mx-2" />

      <button
        onClick={groupSelected}
        disabled={selectedIds.length < 2}
        title="Группировать (Ctrl+G)"
        className="px-3 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        🗂️ Группировать
      </button>

      {/* 👇 НОВАЯ КНОПКА: Разгруппировать */}
      <button
        onClick={() => isGroupSelected && ungroup(selectedIds[0])}
        disabled={!isGroupSelected}
        title="Разгруппировать (Ctrl+Shift+G)"
        className="px-3 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        📂 Разгруппировать
      </button>

      <button
        onClick={handleExport}
        title="Экспорт в PNG"
        className="px-3 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
      >
        📥 Экспорт
      </button>

      <div className="ml-auto flex items-center text-sm text-gray-600">
        <span>
          Инструмент: <span className="font-semibold capitalize">{tool}</span>
        </span>
        {selectedIds.length > 0 && (
          <span className="ml-4 px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
            Выделено: {selectedIds.length}
          </span>
        )}
      </div>
    </div>
  );
};

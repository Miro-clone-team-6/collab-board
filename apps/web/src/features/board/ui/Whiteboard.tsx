"use client";

import Konva from "konva";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Circle, Layer, Line, Rect, Stage } from "react-konva";
// Utils
import { getWorldPosition } from "../lib/coordinates";
import { exportToPNG } from "../lib/export";
import { useBoardStore } from "../model/boardStore";
import { useKeyboardShortcuts } from "../model/hooks/useKeyboardShortcuts";
// Realtime
import { useYjsSync } from "../model/hooks/useYjsSync";
// Types & Store
import type { Shape } from "../model/types";
import { ArrowRenderer } from "./ArrowRenderer";
import { CommentMarker } from "./CommentMarker";
import { CursorsLayer } from "./CursorsLayer";
import { CommentsOverlay } from "./components/CommentsOverlay";
import { SelectionTransformer } from "./SelectionTransformer";
import { ShapeRenderer } from "./ShapeRenderer";
// Components
import { Toolbar } from "./Toolbar";

interface WhiteboardProps {
  width?: number;
  height?: number;
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ width = 1200, height = 700 }) => {
  // ========================================================================
  // 1. ВСЕ ХУКИ ВЫЗЫВАЮТСЯ ЗДЕСЬ (Безусловно, в одном и том же порядке)
  // ========================================================================

  const stageRef = useRef<Konva.Stage>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Zustand selectors
  const selectedIds = useBoardStore((s) => s.selectedIds);
  const tool = useBoardStore((s) => s.tool);
  const shapes = useBoardStore((s) => s.shapes);
  const connections = useBoardStore((s) => s.connections);
  const draftShape = useBoardStore((s) => s.draftShape);

  // Zustand actions
  const addShape = useBoardStore((s) => s.addShape);
  const _selectShape = useBoardStore((s) => s.selectShape);
  const clearSelection = useBoardStore((s) => s.clearSelection);
  const setTool = useBoardStore((s) => s.setTool);
  const setDraftShape = useBoardStore((s) => s.setDraftShape);
  const updateDraftShape = useBoardStore((s) => s.updateDraftShape);
  const addConnection = useBoardStore((s) => s.addConnection);
  const drawingArrow = useBoardStore((s) => s.drawingArrow);
  const startDrawingArrow = useBoardStore((s) => s.startDrawingArrow);
  const updateDrawingArrow = useBoardStore((s) => s.updateDrawingArrow);
  const cancelDrawingArrow = useBoardStore((s) => s.cancelDrawingArrow);

  // Custom hooks
  useKeyboardShortcuts();

  const { provider: yjsProvider, isReady } = useYjsSync("demo-board-1", "anonymous", "Anonymous");

  // Local state
  const [_userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Effects
  useEffect(() => {
    let id = localStorage.getItem("whiteboard-user-id");
    if (!id) {
      id = nanoid();
      localStorage.setItem("whiteboard-user-id", id);
    }
    setUserId(id);

    let name = localStorage.getItem("whiteboard-user-name");
    if (!name) {
      name = `User ${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem("whiteboard-user-name", name);
    }
    setUserName(name);
  }, []);

  useEffect(() => {
    if (!yjsProvider) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        yjsProvider.undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        yjsProvider.redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [yjsProvider]);

  useEffect(() => {
    const handleExport = () => {
      if (stageRef.current) {
        clearSelection();
        setTimeout(() => {
          if (stageRef.current) {
            exportToPNG(stageRef.current, "whiteboard.png");
          }
        }, 100);
      }
    };
    window.addEventListener("export-whiteboard", handleExport);
    return () => window.removeEventListener("export-whiteboard", handleExport);
  }, [clearSelection]);

  // Callbacks
  const getPointerWorldPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    if (!pointer) return { x: 0, y: 0 };
    return getWorldPosition(stage, pointer);
  }, []);

  // ========================================================================
  // 2. УСЛОВНЫЙ RETURN (Теперь безопасен, так как все хуки уже вызваны)
  // ========================================================================
  if (!isReady || !yjsProvider) {
    return (
      <div className="flex flex-col h-screen bg-gray-100 items-center justify-center">
        <div className="text-lg font-semibold text-gray-600 animate-pulse mb-4">
          Инициализация realtime-движка (Yjs)...
        </div>
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ========================================================================
  // 3. ОБРАБОТЧИКИ СОБЫТИЙ (Обычные функции, не хуки)
  // ========================================================================
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = scale;
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    setScale(clampedScale);
    setPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.button === 1) {
      setIsPanning(true);
      dragStartRef.current = stage.getPointerPosition();
      stage.container().style.cursor = "grabbing";
      return;
    }

    if (e.target !== stage) {
      if (tool === "arrow") {
        const targetId = e.target.id();
        if (targetId) {
          const worldPos = getPointerWorldPosition();
          startDrawingArrow(targetId, worldPos.x, worldPos.y);
        }
      }
      return;
    }

    const worldPos = getPointerWorldPosition();

    if (tool === "select") {
      dragStartRef.current = worldPos;
      setSelectionBox({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
      return;
    }

    if (tool === "text") {
      const text = prompt("Введите текст:") || "Новый текст";
      addShape({
        id: nanoid(),
        type: "text",
        x: worldPos.x,
        y: worldPos.y,
        text,
        fontSize: 20,
        width: 200,
        fill: "#111827",
        stroke: "transparent",
        strokeWidth: 0,
      });
      setTool("select");
      return;
    }

    if (tool === "sticky") {
      const text = prompt("Текст стикера:") || "Стикер";
      addShape({
        id: nanoid(),
        type: "sticky",
        x: worldPos.x,
        y: worldPos.y,
        text,
        width: 200,
        height: 200,
        color: "#fef08a",
        fill: "transparent",
        stroke: "transparent",
        strokeWidth: 0,
      });
      setTool("select");
      return;
    }

    if (tool === "comment") {
      const text = prompt("Текст комментария:") || "Комментарий";
      addShape({
        id: nanoid(),
        type: "comment",
        x: worldPos.x,
        y: worldPos.y,
        text,
        author: userName || "Вы",
      });
      setTool("select");
      return;
    }

    dragStartRef.current = worldPos;
    if (tool === "rect") {
      setDraftShape({
        id: "draft",
        type: "rect",
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
        fill: "rgba(59, 130, 246, 0.2)",
        stroke: "#3b82f6",
        strokeWidth: 2,
      });
    } else if (tool === "circle") {
      setDraftShape({
        id: "draft",
        type: "circle",
        x: worldPos.x,
        y: worldPos.y,
        radius: 0,
        fill: "rgba(16, 185, 129, 0.2)",
        stroke: "#10b981",
        strokeWidth: 2,
      });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (isPanning && dragStartRef.current) {
      const pointer = stage.getPointerPosition();
      if (pointer) {
        setPosition({
          x: position.x + (pointer.x - dragStartRef.current.x),
          y: position.y + (pointer.y - dragStartRef.current.y),
        });
        dragStartRef.current = pointer;
      }
      return;
    }

    const worldPos = getPointerWorldPosition();

    if (tool === "select" && selectionBox && dragStartRef.current) {
      const start = dragStartRef.current;
      setSelectionBox({
        x: Math.min(start.x, worldPos.x),
        y: Math.min(start.y, worldPos.y),
        width: Math.abs(worldPos.x - start.x),
        height: Math.abs(worldPos.y - start.y),
      });
      return;
    }

    if (tool === "arrow" && drawingArrow) {
      updateDrawingArrow(worldPos.x, worldPos.y);
      return;
    }

    if (draftShape && dragStartRef.current && draftShape.id === "draft") {
      const start = dragStartRef.current;
      if (draftShape.type === "rect") {
        const width = worldPos.x - start.x;
        const height = worldPos.y - start.y;
        updateDraftShape({
          x: width < 0 ? worldPos.x : start.x,
          y: height < 0 ? worldPos.y : start.y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
      } else if (draftShape.type === "circle") {
        const dx = worldPos.x - start.x;
        const dy = worldPos.y - start.y;
        updateDraftShape({ radius: Math.sqrt(dx * dx + dy * dy) });
      }
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (stage) {
      stage.container().style.cursor = tool === "select" ? "default" : "crosshair";
    }
    setIsPanning(false);

    if (tool === "select" && selectionBox && dragStartRef.current) {
      if (selectionBox.width < 5 && selectionBox.height < 5) {
        clearSelection();
      } else {
        const box = selectionBox;
        const intersectingIds = shapes
          .filter((s) => {
            let sx = s.x;
            let sy = s.y;
            let sw = 0;
            let sh = 0;

            // 🔥 ИСПРАВЛЕНО: Безопасное приведение типа БЕЗ использования 'any'
            // И мы переименовали переменную в typedShape, чтобы Biome не ругался, что она не используется
            const typedShape = s as unknown as {
              width?: number;
              height?: number;
              radius?: number;
              fontSize?: number;
            };

            if ("width" in s) {
              sw = typedShape.width || 0;
              sh = typedShape.height || typedShape.fontSize || 20;
            } else if ("radius" in s) {
              const r = typedShape.radius || 0;
              sw = r * 2;
              sh = r * 2;
              sx -= r;
              sy -= r;
            }

            return (
              sx < box.x + box.width &&
              sx + sw > box.x &&
              sy < box.y + box.height &&
              sy + sh > box.y
            );
          })
          .map((s) => s.id);

        useBoardStore.getState().selectMultiple(intersectingIds);
      }
      setSelectionBox(null);
      dragStartRef.current = null;
      return;
    }

    if (tool === "arrow" && drawingArrow) {
      const worldPos = getPointerWorldPosition();
      const target = shapes.find((s) => {
        if (s.type === "rect" || s.type === "sticky") {
          return (
            worldPos.x >= s.x &&
            worldPos.x <= s.x + s.width &&
            worldPos.y >= s.y &&
            worldPos.y <= s.y + s.height
          );
        }
        if (s.type === "circle") {
          const dx = worldPos.x - s.x;
          const dy = worldPos.y - s.y;
          return Math.sqrt(dx * dx + dy * dy) <= s.radius;
        }
        return false;
      });

      if (target && target.id !== drawingArrow.fromId) {
        addConnection({
          id: nanoid(),
          type: "arrow",
          fromId: drawingArrow.fromId,
          toId: target.id,
          color: "#6b7280",
          strokeWidth: 2,
        });
      }
      cancelDrawingArrow();
    }

    if (draftShape && dragStartRef.current && draftShape.id === "draft") {
      const isBigEnough =
        (draftShape.type === "rect" && draftShape.width > 5 && draftShape.height > 5) ||
        (draftShape.type === "circle" && draftShape.radius > 5);

      if (isBigEnough) {
        addShape({ ...draftShape, id: nanoid() } as Shape);
      }
    }

    dragStartRef.current = null;
    setDraftShape(null);
  };

  const handleMouseLeave = () => {
    setIsPanning(false);
    cancelDrawingArrow();
    setSelectionBox(null);
    setDraftShape(null);
  };

  // ========================================================================
  // 4. JSX РЕНДЕР
  // ========================================================================
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Toolbar />

      <div className="flex-1 overflow-hidden relative">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={false}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            cursor: isPanning ? "grabbing" : tool === "select" ? "default" : "crosshair",
          }}
        >
          <Layer listening={false}>
            <Rect x={-5000} y={-5000} width={10000} height={10000} fill="#f9fafb" />
          </Layer>

          <Layer listening={false}>
            {connections.map((conn) => (
              <ArrowRenderer key={conn.id} connection={conn} />
            ))}
          </Layer>

          <Layer>
            {shapes.map((shape) => {
              if (shape.type === "comment") {
                return <CommentMarker key={shape.id} shape={shape} />;
              }
              return (
                <ShapeRenderer
                  key={shape.id}
                  shape={shape}
                  isSelected={selectedIds.includes(shape.id)}
                />
              );
            })}
          </Layer>

          <Layer listening={false}>
            {draftShape && draftShape.id === "draft" && draftShape.type === "rect" && (
              <Rect {...draftShape} />
            )}
            {draftShape && draftShape.id === "draft" && draftShape.type === "circle" && (
              <Circle {...draftShape} />
            )}

            {selectionBox && (
              <Rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                fill="rgba(59, 130, 246, 0.1)"
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
                listening={false}
              />
            )}

            {drawingArrow &&
              (() => {
                const fromShape = shapes.find((s) => s.id === drawingArrow.fromId);
                if (!fromShape) return null;
                let centerX = fromShape.x;
                let centerY = fromShape.y;
                if ("width" in fromShape && "height" in fromShape) {
                  centerX += fromShape.width / 2;
                  centerY += fromShape.height / 2;
                } else if ("radius" in fromShape) {
                  centerX += fromShape.radius;
                  centerY += fromShape.radius;
                }
                return (
                  <Line
                    points={[centerX, centerY, drawingArrow.toX, drawingArrow.toY]}
                    stroke="#6b7280"
                    strokeWidth={2}
                    dash={[5, 5]}
                    listening={false}
                  />
                );
              })()}
          </Layer>

          <Layer listening={false}>
            <SelectionTransformer />
          </Layer>

          <CursorsLayer />
        </Stage>

        <CommentsOverlay />

        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow text-xs text-gray-600 border border-gray-200">
          <p>
            🖱️ <b>ЛКМ на пустом месте + Drag</b>: Выделение рамкой
          </p>
          <p>
            🖱️ <b>Средняя кнопка мыши</b>: Панорамирование холста
          </p>
          <p>
            🔍 <b>Колесо мыши</b>: Масштабирование (Zoom)
          </p>
          <p>
            ⌨️ <b>Ctrl+Z / Ctrl+Y</b>: Отмена / Возврат | <b>Delete</b>: Удалить
          </p>
        </div>
      </div>
    </div>
  );
};

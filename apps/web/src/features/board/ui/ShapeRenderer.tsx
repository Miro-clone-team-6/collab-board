"use client";

import React from "react";
import { Circle, Group, Rect, Text } from "react-konva";
import { useBoardStore } from "../store/boardStore";
import type { Shape } from "../types";
import { ImageRenderer } from "./components/ImageRenderer";
import { StickyNote } from "./components/StickyNote";

interface ShapeRendererProps {
  shape: Shape;
  isSelected: boolean;
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = React.memo(({ shape, isSelected }) => {
  const selectShape = useBoardStore((s) => s.selectShape);
  const updateShape = useBoardStore((s) => s.updateShape);

  const handleClick = () => {
    selectShape(shape.id);
  };

  const handleDragEnd = (e: any) => {
    const node = e.target;
    // Формируем объект обновления динамически
    const updatePayload: any = {
      x: node.x(),
      y: node.y(),
    };

    // Если у узла есть свойство rotation (например, у Group), сохраняем и его
    if (typeof node.rotation === "function") {
      updatePayload.rotation = node.rotation();
    }

    updateShape(shape.id, updatePayload);
  };

  switch (shape.type) {
    case "rect":
      return (
        <Rect
          {...shape}
          stroke={isSelected ? "#f59e0b" : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 2 : shape.strokeWidth}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={handleDragEnd}
        />
      );

    case "circle":
      return (
        <Circle
          {...shape}
          stroke={isSelected ? "#f59e0b" : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 2 : shape.strokeWidth}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={handleDragEnd}
        />
      );

    case "text":
      return (
        <Text
          {...shape}
          stroke={isSelected ? "#f59e0b" : shape.stroke}
          strokeWidth={isSelected ? shape.strokeWidth + 2 : shape.strokeWidth}
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={handleDragEnd}
        />
      );

    case "sticky":
      return <StickyNote shape={shape} isSelected={isSelected} />;

    case "image":
      return <ImageRenderer shape={shape} isSelected={isSelected} />;

    // 👇 НОВОЕ: Рендеринг группы
    case "group":
      return (
        <Group
          id={shape.id}
          name={shape.id}
          x={shape.x}
          y={shape.y}
          rotation={shape.rotation || 0}
          scaleX={shape.scaleX || 1} // <-- ДОБАВЛЕНО
          scaleY={shape.scaleY || 1} // <-- ДОБАВЛЕНО
          draggable
          onClick={handleClick}
          onTap={handleClick}
          onDragEnd={(e: any) => {
            const node = e.target;
            updateShape(shape.id, {
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(), // <-- ДОБАВЛЕНО
              scaleY: node.scaleY(), // <-- ДОБАВЛЕНО
            });
          }}
        >
          {shape.children.map((child) => (
            <ShapeRenderer key={child.id} shape={child} isSelected={false} />
          ))}
        </Group>
      );

    case "comment":
      return null; // Комментарии обрабатываются отдельно через CommentsOverlay

    default: {
      // Exhaustive check: если добавится новый тип, TypeScript напомнит обработать его здесь
      const _exhaustiveCheck: never = shape;
      return null;
    }
  }
});

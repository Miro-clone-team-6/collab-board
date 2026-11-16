// src/features/board/ui/components/StickyNote.tsx

"use client";

import React from "react";
import { Group, Rect, Text } from "react-konva";
import { useBoardStore } from "../../store/boardStore";
import type { StickyShape } from "../../types";

interface StickyNoteProps {
  shape: StickyShape;
  isSelected: boolean;
}

export const StickyNote: React.FC<StickyNoteProps> = React.memo(({ shape, isSelected }) => {
  const selectShape = useBoardStore((s) => s.selectShape);
  const updateShape = useBoardStore((s) => s.updateShape);

  const handleClick = () => selectShape(shape.id);

  const handleDragEnd = (e: any) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const stroke = isSelected ? "#f59e0b" : shape.stroke;
  const strokeWidth = isSelected ? shape.strokeWidth + 2 : shape.strokeWidth;

  return (
    <Group
      id={shape.id}
      name={shape.id}
      x={shape.x}
      y={shape.y}
      draggable
      onClick={handleClick}
      onTap={handleClick}
      onDragEnd={handleDragEnd}
    >
      <Rect
        width={shape.width}
        height={shape.height}
        fill={shape.color}
        stroke={stroke}
        strokeWidth={strokeWidth}
        cornerRadius={8}
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.2}
        shadowOffset={{ x: 2, y: 2 }}
      />
      <Text
        text={shape.text}
        width={shape.width - 20}
        height={shape.height - 20}
        x={10}
        y={10}
        fontSize={16}
        fill="#111"
        wrap="word"
        listening={false}
      />
    </Group>
  );
});

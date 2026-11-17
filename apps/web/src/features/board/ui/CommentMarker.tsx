// src/features/board/ui/CommentMarker.tsx

"use client";

import React from "react";
import { Circle, Group, Text } from "react-konva";
import { useBoardStore } from "../model/boardStore";
import type { CommentShape } from "../model/types";

interface CommentMarkerProps {
  shape: CommentShape;
}

export const CommentMarker: React.FC<CommentMarkerProps> = ({ shape }) => {
  const toggleComment = useBoardStore((s) => s.toggleComment);
  const openComments = useBoardStore((s) => s.openComments);

  if (!shape || typeof shape !== "object" || !shape.id) {
    return null;
  }

  const _author =
    typeof shape.author === "string" && shape.author.length > 0 ? shape.author : "Аноним";

  const _text =
    typeof shape.text === "string" && shape.text.length > 0 ? shape.text : "Комментарий";

  const isOpen = openComments.includes(shape.id);

  return (
    <Group
      id={shape.id}
      x={shape.x}
      y={shape.y}
      onClick={() => toggleComment(shape.id)}
      onTap={() => toggleComment(shape.id)}
    >
      <Circle
        radius={15}
        fill={isOpen ? "#fbbf24" : "#f59e0b"} // Меняем цвет при открытии
        stroke="#ffffff"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.2}
        shadowOffset={{ x: 1, y: 1 }}
      />
      <Text text="💬" fontSize={16} offsetX={8} offsetY={10} listening={false} />
    </Group>
  );
};

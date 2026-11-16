// src/features/board/ui/ArrowRenderer.tsx

"use client";

import React from "react";
import { Arrow, Label, Tag, Text } from "react-konva";
import { useBoardStore } from "../store/boardStore";
import type { Connection } from "../types";
import { getConnectionPoints } from "../utils/anchors";

interface ArrowRendererProps {
  connection: Connection;
}

export const ArrowRenderer: React.FC<ArrowRendererProps> = React.memo(({ connection }) => {
  const shapes = useBoardStore((s) => s.shapes);

  const fromShape = shapes.find((s) => s.id === connection.fromId);
  const toShape = shapes.find((s) => s.id === connection.toId);

  if (!fromShape || !toShape) return null;

  const { from, to } = getConnectionPoints(fromShape, toShape);
  const points = [from.x, from.y, to.x, to.y];
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  return (
    <>
      <Arrow
        id={connection.id}
        points={points}
        fill={connection.color}
        stroke={connection.color}
        strokeWidth={connection.strokeWidth}
        pointerLength={10}
        pointerWidth={10}
      />
      {connection.label && (
        <Label x={midX} y={midY} offsetX={20} offsetY={10}>
          <Tag fill="#fff" stroke={connection.color} cornerRadius={4} />
          <Text text={connection.label} fontSize={12} fill="#111" padding={4} />
        </Label>
      )}
    </>
  );
});

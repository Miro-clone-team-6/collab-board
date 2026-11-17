"use client";

import React, { memo } from "react";
import { Group, Layer, Path, Text } from "react-konva";
import { useBoardStore } from "../model/boardStore";
import type { Cursor } from "../model/types";

// 🔥 ИСПРАВЛЕНО: Мемоизация отдельного курсора.
// Он перерисуется только если изменятся именно его пропсы (x, y, color, userName)
const CursorItem = memo(({ cursor }: { cursor: Cursor }) => {
  return (
    <Group x={cursor.x || 0} y={cursor.y || 0}>
      <Path
        data="M0,0 L0,16 L4,12 L8,20 L10,19 L6,11 L12,11 Z"
        fill={cursor.color || "#3b82f6"}
        stroke="white"
        strokeWidth={1.5}
      />
      <Text
        text={cursor.userName || "User"}
        fontSize={12}
        fill={cursor.color || "#3b82f6"}
        x={12}
        y={12}
        fontStyle="bold"
        shadowColor="white"
        shadowBlur={2}
        shadowOffset={{ x: 1, y: 1 }}
      />
    </Group>
  );
});
CursorItem.displayName = "CursorItem";

export const CursorsLayer: React.FC = () => {
  const cursors = useBoardStore((state) => state.cursors);

  if (!cursors || cursors.length === 0) return null;

  return (
    <Layer listening={false}>
      {cursors.map((cursor) => (
        <CursorItem key={cursor.id} cursor={cursor} />
      ))}
    </Layer>
  );
};

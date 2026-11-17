// src/features/board/ui/CursorsLayer.tsx

"use client";

import React from "react";
import { Group, Path, Text } from "react-konva";
import { useBoardStore } from "../model/boardStore";

export const CursorsLayer: React.FC = () => {
  const cursors = useBoardStore((s) => s.cursors);

  return (
    <>
      {cursors.map((cursor) => (
        <Group key={cursor.id} x={cursor.x} y={cursor.y}>
          {/* Иконка курсора (SVG path) */}
          <Path
            data="M0,0 L0,16 L4,12 L8,20 L10,19 L6,11 L12,11 Z"
            fill={cursor.color}
            stroke="#fff"
            strokeWidth={1}
          />
          {/* Имя пользователя */}
          <Group x={14} y={14}>
            <Text
              text={cursor.userName}
              fontSize={12}
              fontFamily="Arial"
              fill="#fff"
              padding={4}
              // Фон для имени
              fillEnabled={true}
            />
            {/* Подложка под текст */}
            <Text
              text={cursor.userName}
              fontSize={12}
              fontFamily="Arial"
              fill={cursor.color}
              padding={4}
              listening={false}
            />
          </Group>
        </Group>
      ))}
    </>
  );
};

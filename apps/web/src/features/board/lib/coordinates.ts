// src/features/board/utils/coordinates.ts

import Konva from "konva";

// Преобразование координат экрана в мировые координаты (с учётом зума и панорамирования)
export function getWorldPosition(stage: Konva.Stage, pointer: { x: number; y: number }) {
  const scale = stage.scaleX();
  const position = stage.position();

  return {
    x: (pointer.x - position.x) / scale,
    y: (pointer.y - position.y) / scale,
  };
}

// Преобразование мировых координат в экранные
export function getScreenPosition(stage: Konva.Stage, world: { x: number; y: number }) {
  const scale = stage.scaleX();
  const position = stage.position();

  return {
    x: world.x * scale + position.x,
    y: world.y * scale + position.y,
  };
}

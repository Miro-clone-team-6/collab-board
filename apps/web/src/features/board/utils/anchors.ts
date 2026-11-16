// src/features/board/utils/anchors.ts

import type { Shape } from "../types";

// Возвращает 4 точки привязки фигуры (верх, право, низ, лево)
export function getAnchorPoints(shape: Shape): { x: number; y: number }[] {
  if (shape.type === "rect" || shape.type === "text" || shape.type === "sticky") {
    const w = shape.width;
    const h = "height" in shape ? shape.height : shape.fontSize;
    return [
      { x: shape.x + w / 2, y: shape.y },
      { x: shape.x + w, y: shape.y + h / 2 },
      { x: shape.x + w / 2, y: shape.y + h },
      { x: shape.x, y: shape.y + h / 2 },
    ];
  }
  if (shape.type === "circle") {
    const r = shape.radius;
    return [
      { x: shape.x, y: shape.y - r },
      { x: shape.x + r, y: shape.y },
      { x: shape.x, y: shape.y + r },
      { x: shape.x - r, y: shape.y },
    ];
  }
  return [{ x: shape.x, y: shape.y }];
}

// Находит ближайшие точки привязки между двумя фигурами
export function getConnectionPoints(from: Shape, to: Shape) {
  const fromAnchors = getAnchorPoints(from);
  const toAnchors = getAnchorPoints(to);

  let minDist = Infinity;
  let bestFrom = fromAnchors[0];
  let bestTo = toAnchors[0];

  for (const fa of fromAnchors) {
    for (const ta of toAnchors) {
      const dist = Math.hypot(fa.x - ta.x, fa.y - ta.y);
      if (dist < minDist) {
        minDist = dist;
        bestFrom = fa;
        bestTo = ta;
      }
    }
  }

  return { from: bestFrom, to: bestTo };
}

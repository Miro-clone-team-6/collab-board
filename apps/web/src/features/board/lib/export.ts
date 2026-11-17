// src/features/board/utils/export.ts

import Konva from "konva";

export function exportToPNG(stage: Konva.Stage, filename = "whiteboard.png") {
  const dataURL = stage.toDataURL({
    pixelRatio: 2,
    mimeType: "image/png",
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataURL;
  link.click();
}

export function exportSelectionToPNG(
  stage: Konva.Stage,
  bounds: { x: number; y: number; width: number; height: number },
) {
  const dataURL = stage.toDataURL({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = "selection.png";
  link.href = dataURL;
  link.click();
}

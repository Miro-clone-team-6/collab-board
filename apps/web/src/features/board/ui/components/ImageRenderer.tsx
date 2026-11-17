// src/features/board/ui/components/ImageRenderer.tsx

"use client";

import Konva from "konva";
import React from "react";
import { Image, Rect } from "react-konva";
import useImage from "use-image";
import { useBoardStore } from "../../model/boardStore";
import type { ImageShape } from "../../model/types";

interface ImageRendererProps {
  shape: ImageShape;
  isSelected: boolean;
}

export const ImageRenderer: React.FC<ImageRendererProps> = React.memo(({ shape, isSelected }) => {
  const [img] = useImage(shape.src, "anonymous");
  const selectShape = useBoardStore((s) => s.selectShape);
  const updateShape = useBoardStore((s) => s.updateShape);

  const handleClick = () => selectShape(shape.id);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateShape(shape.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  return (
    <>
      <Image
        id={shape.id}
        name={shape.id}
        image={img}
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        draggable
        onClick={handleClick}
        onTap={handleClick}
        onDragEnd={handleDragEnd}
      />
      {isSelected && (
        <Rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          stroke="#f59e0b"
          strokeWidth={3}
          listening={false}
        />
      )}
    </>
  );
});

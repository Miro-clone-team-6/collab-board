"use client";

import Konva from "konva";
import React, { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import { useBoardStore } from "../model/boardStore";
import type { Shape } from "../model/types";

export const SelectionTransformer: React.FC = () => {
  const selectedIds = useBoardStore((s) => s.selectedIds);
  const updateShape = useBoardStore((s) => s.updateShape);
  const clearSelection = useBoardStore((s) => s.clearSelection);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    if (selectedIds.length > 0) {
      const stage = transformer.getStage();
      if (!stage) return;

      const nodes = selectedIds
        // 1. Защита: оставляем только валидные строки ID
        .filter((id): id is string => typeof id === "string" && id.length > 0)
        // 2. Ищем узлы в Konva
        .map((id) => stage.findOne(`#${id}`))
        // 3. Защита: узел должен существовать (не null/undefined) И иметь родителя (быть на сцене)
        .filter((node): node is Konva.Node => Boolean(node?.parent));

      if (nodes.length > 0) {
        transformer.nodes(nodes);
        transformer.getLayer()?.batchDraw();
      } else {
        // Если валидных узлов не найдено, очищаем выделение, чтобы избежать ошибок
        transformer.nodes([]);
        clearSelection();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds, clearSelection]);

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const nodes = transformer.nodes();

    nodes.forEach((node) => {
      const id = node.id();
      if (!id) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      const rotation = node.rotation();

      // Сбрасываем масштаб ноды, чтобы он не накапливался
      node.scaleX(1);
      node.scaleY(1);

      const baseUpdate = {
        x: node.x(),
        y: node.y(),
        rotation,
      };

      const className = node.getClassName();

      if (className === "Rect" || className === "Text" || className === "Image") {
        const sizedNode = node as Konva.Rect | Konva.Text | Konva.Image;
        updateShape(id, {
          ...baseUpdate,
          width: Math.max(10, sizedNode.width() * scaleX),
          height: Math.max(10, sizedNode.height() * scaleY),
        } as Partial<Shape>);
      } else if (className === "Circle") {
        const circleNode = node as Konva.Circle;
        updateShape(id, {
          ...baseUpdate,
          radius: Math.max(10, circleNode.radius() * Math.max(scaleX, scaleY)),
        } as Partial<Shape>);
      } else if (className === "Group") {
        const groupNode = node as Konva.Group;
        updateShape(id, {
          x: groupNode.x(),
          y: groupNode.y(),
          rotation: groupNode.rotation(),
          scaleX: groupNode.scaleX(),
          scaleY: groupNode.scaleY(),
        } as Partial<Shape>);
      } else {
        updateShape(id, baseUpdate as Partial<Shape>);
      }
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled={true}
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) return oldBox;
        return newBox;
      }}
      onTransformEnd={handleTransformEnd}
      anchorStroke="#3b82f6"
      anchorFill="#ffffff"
      borderStroke="#3b82f6"
      borderDash={[4, 4]}
      shouldOverdrawWholeArea={false}
    />
  );
};

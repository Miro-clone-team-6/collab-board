// src/features/board/ui/CommentsOverlay.tsx

"use client";

import React from "react";
import { useBoardStore } from "../../store/boardStore";
import type { CommentShape } from "../../types/index";

export const CommentsOverlay: React.FC = () => {
  const shapes = useBoardStore((s) => s.shapes);
  const openComments = useBoardStore((s) => s.openComments);
  const closeComment = useBoardStore((s) => s.closeComment);

  // Фильтруем только открытые комментарии
  const comments = shapes.filter(
    (s): s is CommentShape => s.type === "comment" && openComments.includes(s.id),
  );

  if (comments.length === 0) return null;

  return (
    <>
      {comments.map((comment) => {
        const author = typeof comment.author === "string" ? comment.author : "Аноним";
        const text = typeof comment.text === "string" ? comment.text : "Комментарий";

        return (
          <div
            key={comment.id}
            className="absolute bg-white rounded-lg shadow-xl p-3 w-64 border border-gray-200 z-50"
            style={{
              left: comment.x + 20,
              top: comment.y,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm text-gray-900">{author}</div>
              <button
                className="text-gray-400 hover:text-gray-600 text-xs"
                onClick={() => closeComment(comment.id)}
                aria-label="Закрыть комментарий"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 break-words">{text}</div>
          </div>
        );
      })}
    </>
  );
};

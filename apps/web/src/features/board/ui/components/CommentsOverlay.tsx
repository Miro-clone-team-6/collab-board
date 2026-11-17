"use client";

import React from "react";
import { useBoardStore } from "../../model/boardStore";
import type { CommentShape } from "../../model/types/index";

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
          <button
            type="button"
            key={comment.id}
            className="absolute z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-left"
            style={{ top: comment.y, left: comment.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-sm text-gray-900">{author}</div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-xs"
                onClick={() => closeComment(comment.id)}
                aria-label="Закрыть комментарий"
              >
                ✕
              </button>
            </div>
            <div className="text-sm text-gray-700 break-words">{text}</div>
          </button>
        );
      })}
    </>
  );
};

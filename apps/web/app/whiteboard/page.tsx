"use client";

import dynamic from "next/dynamic";

const Whiteboard = dynamic(
  () => import("@/features/board/ui/Whiteboard").then((mod) => mod.Whiteboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-500">Загрузка доски...</p>
      </div>
    ),
  },
);

export default function WhiteboardPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-gray-50">
      <Whiteboard />
    </main>
  );
}

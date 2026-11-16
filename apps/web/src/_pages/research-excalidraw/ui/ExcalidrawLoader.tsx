"use client";

import dynamic from "next/dynamic";

const ExcalidrawEditor = dynamic(() => import("./ExcalidrawEditor"), {
  ssr: false,
  loading: () => <output className="p-4">Загрузка редактора…</output>,
});

export function ExcalidrawLoader() {
  return <ExcalidrawEditor />;
}

"use client";

import dynamic from "next/dynamic";

const TldrawEditor = dynamic(() => import("./TldrawEditor"), {
  ssr: false,
  loading: () => <output>Загрузка редактора…</output>,
});

export function TldrawLoader() {
  return <TldrawEditor />;
}

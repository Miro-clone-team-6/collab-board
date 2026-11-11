"use client";

import { useHealthControllerCheck } from "@packages/api";

export function HomePage() {
  const { data, isLoading, error } = useHealthControllerCheck();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <h1 className="text-4xl font-extrabold tracking-tight">CollabBoard 🎨</h1>
      <div className="mt-4 p-4 border rounded-lg">
        <p className="text-sm font-semibold">Статус бэкенда через TanStack Query:</p>
        {isLoading && <p className="text-muted-foreground">Загрузка...</p>}
        {error ? <p className="text-red-500">Ошибка подключения к API</p> : null}
        {data ? (
          <p className="text-emerald-500 font-mono mt-1">
            Status: {data.status} | DB: {data.database} | Uptime: {Math.round(data.uptime)}s
          </p>
        ) : null}
      </div>
    </main>
  );
}

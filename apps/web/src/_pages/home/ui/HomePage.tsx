"use client";

import { useHealthControllerCheck } from "@packages/api";
import Link from "next/link";
import { getBoards } from "@/entities/board";
import { getCurrentUser } from "@/entities/user";
import { routes } from "@/shared/config/routes";
import { BoardList } from "@/widgets/board-list";
import { Header } from "@/widgets/header";

export function HomePage() {
  const { data, isLoading, error } = useHealthControllerCheck();
  const user = getCurrentUser();
  const recentBoards = getBoards().slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Привет, {user.name}</h1>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Недавние доски</h2>
            <Link href={routes.boards} className="text-sm underline">
              Все доски
            </Link>
          </div>
          <BoardList boards={recentBoards} />
        </section>

        <section className="rounded-lg border p-4 text-sm">
          <p className="font-semibold">Статус бэкенда через TanStack Query:</p>
          {isLoading && <p className="text-muted-foreground">Загрузка...</p>}
          {error ? <p className="text-red-500">Ошибка подключения к API</p> : null}
          {data ? (
            <p className="text-emerald-500 font-mono mt-1">
              Status: {data.status} | DB: {data.database} | Uptime: {Math.round(data.uptime)}s
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}

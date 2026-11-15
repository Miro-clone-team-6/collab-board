import Link from "next/link";
import { TldrawLoader } from "./TldrawLoader";

export function ResearchTldrawPage() {
  return (
    <main className="flex h-dvh flex-col bg-background text-foreground">
      <header className="shrink-0 border-b px-4 py-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-semibold">Research: tldraw PoC</h1>
          <Link href="/boards" className="underline">
            К списку досок
          </Link>
        </div>
        <p>
          Только тестовые данные. Комната общая и публичная; данные удаляются примерно через сутки.
          Откройте эту страницу в двух вкладках для проверки совместного редактирования.
        </p>
      </header>
      <div className="relative min-h-0 flex-1">
        <TldrawLoader />
      </div>
    </main>
  );
}

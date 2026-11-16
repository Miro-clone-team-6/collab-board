import { ExcalidrawLoader } from "./ExcalidrawLoader";

export function ResearchExcalidrawPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-4 py-2">
        <h1 className="font-semibold">Excalidraw PoC</h1>
        <p className="text-sm text-muted-foreground">
          Общая тестовая комната в памяти сервера. Используйте только вымышленные данные. Последняя
          полученная сервером сцена побеждает при конфликтах.
        </p>
      </header>
      <div className="relative min-h-0 flex-1">
        <ExcalidrawLoader />
      </div>
    </main>
  );
}

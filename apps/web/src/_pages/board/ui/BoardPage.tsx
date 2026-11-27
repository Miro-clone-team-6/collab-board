import { BoardEditor } from "@/widgets/board-editor";

export function BoardPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="shrink-0 border-b border-border px-4 py-2">
        <h1 className="font-semibold">Доска</h1>
      </header>
      <div className="relative min-h-0 flex-1">
        <BoardEditor />
      </div>
    </main>
  );
}

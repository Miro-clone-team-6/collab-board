import { getBoards } from "@/entities/board";
import { BoardList } from "@/widgets/board-list";
import { Header } from "@/widgets/header";

export function BoardsPage() {
  const boards = getBoards();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Доски</h1>
        <BoardList boards={boards} />
      </main>
    </div>
  );
}

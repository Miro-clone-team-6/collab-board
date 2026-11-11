import { type Board, BoardCard } from "@/entities/board";
import { CreateBoardButton } from "@/features/create-board";

export function BoardList({ boards }: { boards: Board[] }) {
  if (boards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border p-8">
        <p className="text-muted-foreground">Досок пока нет</p>
        <CreateBoardButton />
      </div>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <li key={board.id}>
          <BoardCard board={board} />
        </li>
      ))}
    </ul>
  );
}

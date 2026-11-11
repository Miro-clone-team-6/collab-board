import { formatDate } from "@/shared/lib/date/format-date";
import type { Board } from "../model/types";

export function BoardCard({ board }: { board: Board }) {
  return (
    <article className="rounded-lg border p-4 text-left">
      <h3 className="font-semibold">{board.title}</h3>
      <p className="text-sm text-muted-foreground">Изменена {formatDate(board.updatedAt)}</p>
    </article>
  );
}

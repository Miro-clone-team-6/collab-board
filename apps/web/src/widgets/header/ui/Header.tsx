import Link from "next/link";
import { getCurrentUser, UserAvatar } from "@/entities/user";
import { CreateBoardButton } from "@/features/create-board";
import { ThemeToggle } from "@/features/toggle-theme";

export function Header() {
  const user = getCurrentUser();

  return (
    <header className="flex items-center justify-between gap-4 border-b px-6 py-3">
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/" className="text-base font-extrabold">
          CollabBoard
        </Link>
        <Link href="/boards">Доски</Link>
      </nav>
      <div className="flex items-center gap-2">
        <CreateBoardButton />
        <ThemeToggle />
        <UserAvatar user={user} />
      </div>
    </header>
  );
}

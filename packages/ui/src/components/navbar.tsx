import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export interface NavbarSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface NavbarSyncStatus {
  connected: boolean;
  label: string;
}

export interface NavbarProps {
  search?: NavbarSearchProps;
  workspaceName?: string;
  onWorkspaceClick?: () => void;
  syncStatus?: NavbarSyncStatus;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  userAvatar?: string;
  userInitials?: string;
  rightActions?: ReactNode;
  className?: string;
}

export function Navbar({
  search,
  workspaceName,
  onWorkspaceClick,
  syncStatus,
  notificationCount,
  onNotificationsClick,
  userAvatar,
  userInitials,
  rightActions,
  className,
}: NavbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b bg-background px-4",
        className,
      )}
    >
      {/* Левая часть: Поиск */}
      <div className="flex flex-1 items-center gap-4">
        {search && (
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || "Search boards, cards, tags..."}
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-input"
            />
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        )}
      </div>

      {/* Центральная/Правая часть: Статусы и действия */}
      <div className="flex items-center gap-4">
        {workspaceName && (
          <Badge
            variant="secondary"
            className="cursor-pointer gap-1 hover:bg-accent"
            onClick={onWorkspaceClick}
          >
            {workspaceName}
          </Badge>
        )}

        {syncStatus && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                syncStatus.connected ? "bg-success" : "bg-destructive",
              )}
              aria-hidden="true"
            />
            {syncStatus.label}
          </div>
        )}

        {notificationCount !== undefined && (
          <Button variant="ghost" size="icon" className="relative" onClick={onNotificationsClick}>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            )}
          </Button>
        )}

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={userAvatar} alt="User" />
          <AvatarFallback>{userInitials || "U"}</AvatarFallback>
        </Avatar>

        {rightActions}
      </div>
    </header>
  );
}

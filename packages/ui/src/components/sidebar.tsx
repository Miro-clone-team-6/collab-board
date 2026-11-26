import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export interface SidebarItem {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  logo?: ReactNode;
  primaryAction?: ReactNode;
  sections: SidebarSection[];
  footer?: ReactNode;
  className?: string;
}

export function Sidebar({ logo, primaryAction, sections, footer, className }: SidebarProps) {
  return (
    <aside className={cn("flex h-screen w-64 flex-col border-r bg-background", className)}>
      {/* Логотип */}
      <div className="flex h-14 items-center px-4">{logo}</div>

      {/* Главная кнопка действия */}
      {primaryAction && <div className="px-4 pb-4">{primaryAction}</div>}

      {/* Навигация */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 pb-4">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    type="button"
                    onClick={item.onClick}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              {idx < sections.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Футер (например, AI-блок) */}
      {footer && <div className="border-t p-4">{footer}</div>}
    </aside>
  );
}

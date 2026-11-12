"use client";

import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function CreateBoardButton() {
  // Заглушка до появления API.
  return (
    <Button onClick={() => window.alert("Создание доски появится позже")}>
      <Plus className="size-4" />
      Новая доска
    </Button>
  );
}

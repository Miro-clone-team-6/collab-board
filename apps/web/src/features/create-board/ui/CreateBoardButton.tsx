"use client";

import { Button } from "@packages/ui";
import { Plus } from "lucide-react";

export function CreateBoardButton() {
  // Заглушка до появления API.
  return (
    <Button onClick={() => window.alert("Создание доски появится позже")}>
      <Plus className="size-4" />
      Новая доска
    </Button>
  );
}

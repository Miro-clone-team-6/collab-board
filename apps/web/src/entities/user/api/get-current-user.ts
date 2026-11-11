import type { User } from "../model/types";

// Заглушка до появления авторизации.
export function getCurrentUser(): User {
  return { id: "1", name: "Алекс" };
}

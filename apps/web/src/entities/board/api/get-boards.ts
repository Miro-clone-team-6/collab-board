import type { Board } from "../model/types";

// Заглушка до появления API.
const boards: Board[] = [
  { id: "1", title: "Ретро спринта", updatedAt: "2026-11-10" },
  { id: "2", title: "Карта пользовательского пути", updatedAt: "2026-11-08" },
  { id: "3", title: "Брейншторм фич", updatedAt: "2026-11-01" },
];

export function getBoards() {
  return boards;
}

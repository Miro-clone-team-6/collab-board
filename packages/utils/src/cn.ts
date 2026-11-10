import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет CSS классы с помощью clsx и tailwind-merge,
 * корректно разрешая конфликты Tailwind-утилит.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

import type { Metadata } from "next";
import { AppProviders } from "./providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "CollabBoard — Интерактивная доска",
  description: "Сервис совместной работы на интерактивных досках в режиме реального времени",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

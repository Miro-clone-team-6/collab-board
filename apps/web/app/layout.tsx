import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { AppProviders } from "@/_app/entrypoint/AppProviders";
import "@/_app/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CollabBoard — Интерактивная доска",
  description: "Сервис совместной работы на интерактивных досках в режиме реального времени",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

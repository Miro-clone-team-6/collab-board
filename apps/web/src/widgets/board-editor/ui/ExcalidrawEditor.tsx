"use client";

import {
  Button,
  CaptureUpdateAction,
  convertToExcalidrawElements,
  Excalidraw,
  viewportCoordsToSceneCoords,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { StickyNote } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { connectExcalidrawRoom } from "../model/excalidraw-room";
import "@excalidraw/excalidraw/index.css";
import { BoardConnectionStatus } from "../model/types";

const connectionIndicator = {
  connecting: { label: "Подключение к доске", color: "bg-muted-foreground" },
  connected: { label: "Доска подключена", color: "bg-emerald-500" },
  syncing: { label: "Синхронизация правок", color: "bg-amber-500" },
  reconnecting: { label: "Соединение с доской восстанавливается", color: "bg-amber-500" },
  conflict: { label: "Конфликт правок. Показано состояние сервера", color: "bg-red-500" },
} satisfies Record<BoardConnectionStatus, { label: string; color: string }>;

export default function ExcalidrawEditor() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [connection, setConnection] = useState<BoardConnectionStatus>("connecting");
  const { label, color } = connectionIndicator[connection];
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (api) return connectExcalidrawRoom(api, setConnection);
  }, [api]);

  function addSticky() {
    if (!api) return;
    const state = api.getAppState();
    const center = viewportCoordsToSceneCoords(
      { clientX: state.offsetLeft + state.width / 2, clientY: state.offsetTop + state.height / 2 },
      state,
    );
    const elements = convertToExcalidrawElements([
      {
        type: "rectangle",
        x: center.x - 100,
        y: center.y - 80,
        width: 200,
        height: 160,
        backgroundColor: "#ffec99",
        fillStyle: "solid",
        roughness: 0,
        label: { text: "Новый стикер", fontSize: 20 },
      },
    ]);
    api.updateScene({
      elements: [...api.getSceneElementsIncludingDeleted(), ...elements],
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    api.setActiveTool({ type: "selection" });
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-2">
        <output className="inline-flex size-6 shrink-0 items-center justify-center" title={label}>
          <span aria-hidden="true" className={`size-2.5 rounded-full ${color}`} />
          <span className="sr-only">{label}</span>
        </output>
      </div>
      <div className="relative min-h-0 flex-1">
        <Excalidraw
          excalidrawAPI={setApi}
          langCode="ru-RU"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          renderTopRightUI={() => (
            <Button
              aria-label="Добавить стикер"
              className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-highlight-color)] disabled:opacity-50"
              disabled={!api}
              onSelect={addSticky}
              style={{ padding: 0 }}
              title="Добавить стикер"
            >
              <StickyNote aria-hidden="true" />
            </Button>
          )}
        />
      </div>
    </div>
  );
}

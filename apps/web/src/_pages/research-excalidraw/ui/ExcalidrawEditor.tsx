"use client";

import {
  CaptureUpdateAction,
  convertToExcalidrawElements,
  Excalidraw,
  loadFromBlob,
  newElementWith,
  serializeAsJSON,
  viewportCoordsToSceneCoords,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { connectExcalidrawRoom } from "./excalidraw-room";
import "@excalidraw/excalidraw/index.css";

const STORAGE_KEY = "collab-board:research:excalidraw:scene:v1";

export default function ExcalidrawEditor() {
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const [message, setMessage] = useState("Сцена ещё не сохранена в этой сессии.");
  const [restoring, setRestoring] = useState(false);
  const [connection, setConnection] = useState("Подключение к тестовой комнате…");
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

  function saveScene() {
    if (!api) return;
    try {
      const json = serializeAsJSON(
        api.getSceneElements(),
        api.getAppState(),
        api.getFiles(),
        "local",
      );
      localStorage.setItem(STORAGE_KEY, json);
      setMessage("Сцена и изображения сохранены в этом браузере.");
    } catch {
      setMessage("Не удалось сохранить: хранилище недоступно или переполнено. Экспортируйте файл.");
    }
  }

  async function restoreScene() {
    if (!api) return;
    setRestoring(true);
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        setMessage("В этом браузере нет сохранённой сцены.");
        return;
      }
      // Parse and restore before replacing the current scene.
      const scene = await loadFromBlob(new Blob([json], { type: "application/json" }), null, null);
      const restored = scene.elements ?? [];
      const restoredIds = new Set(restored.map((element) => element.id));
      const deleted = api
        .getSceneElementsIncludingDeleted()
        .filter((element) => !restoredIds.has(element.id))
        .map((element) => newElementWith(element, { isDeleted: true }));
      api.addFiles(Object.values(scene.files ?? {}));
      api.updateScene({
        ...scene,
        elements: [...restored, ...deleted],
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      api.history.clear();
      setMessage("Сохранённая сцена восстановлена. История Undo/Redo начата заново.");
    } catch {
      setMessage("Не удалось восстановить сцену: хранилище недоступно или данные повреждены.");
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <Button disabled={!api || restoring} onClick={addSticky}>
          Добавить стикер
        </Button>
        <Button variant="outline" disabled={!api || restoring} onClick={saveScene}>
          Сохранить в браузере
        </Button>
        <Button variant="outline" disabled={!api || restoring} onClick={restoreScene}>
          Восстановить сохранённое
        </Button>
        <output className="text-sm text-muted-foreground">{message}</output>
        <output className="w-full text-sm text-muted-foreground">{connection}</output>
      </div>
      <div className="relative min-h-0 flex-1">
        <Excalidraw
          excalidrawAPI={setApi}
          langCode="ru-RU"
          theme={resolvedTheme === "dark" ? "dark" : "light"}
        />
      </div>
    </div>
  );
}

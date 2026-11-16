"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { getYjsProvider, YjsSocketProvider } from "../realtime/yjsProvider";
import { useBoardStore } from "../store/boardStore";
// Типы приложения (Zustand / React)
import type { Connection, Cursor, Shape } from "../types";
// Типы для внутреннего устройства Yjs
import type { AwarenessState, YConnectionData } from "../types/yjs.types";

export const useYjsSync = (boardId: string, userId: string, userName: string) => {
  const providerRef = useRef<YjsSocketProvider | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Храним оригинальные действия стора, чтобы избежать бесконечных циклов
  const originalActionsRef = useRef({
    addShape: useBoardStore.getState().addShape,
    updateShape: useBoardStore.getState().updateShape,
    removeShape: useBoardStore.getState().removeShape,
    addConnection: useBoardStore.getState().addConnection,
    removeConnection: useBoardStore.getState().removeConnection,
  });

  useEffect(() => {
    const provider = getYjsProvider({ boardId, userId, userName });
    providerRef.current = provider;
    setIsReady(true);

    // === 1. Yjs → Zustand (получение данных от других клиентов) ===

    const shapesObserver = (event: Y.YMapEvent<unknown>) => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === "delete") {
          useBoardStore.getState().removeShape(key);
          return;
        }

        const shapeData = provider.shapes.get(key) as Y.Map<unknown> | undefined;
        if (!shapeData) return;

        if (change.action === "add" || change.action === "update") {
          const shape: Shape = {
            id: key,
            type: shapeData.get("type") as string,
            x: shapeData.get("x") as number,
            y: shapeData.get("y") as number,
            fill: shapeData.get("fill") as string | undefined,
            stroke: shapeData.get("stroke") as string | undefined,
            strokeWidth: shapeData.get("strokeWidth") as number | undefined,
            rotation: (shapeData.get("rotation") as number) || 0,
            ...(shapeData.get("type") === "rect" && {
              width: shapeData.get("width") as number,
              height: shapeData.get("height") as number,
            }),
            ...(shapeData.get("type") === "circle" && {
              radius: shapeData.get("radius") as number,
            }),
            ...(shapeData.get("type") === "text" && {
              text: shapeData.get("text") as string,
              fontSize: shapeData.get("fontSize") as number,
              width: shapeData.get("width") as number,
            }),
            ...(shapeData.get("type") === "sticky" && {
              text: shapeData.get("text") as string,
              width: shapeData.get("width") as number,
              height: shapeData.get("height") as number,
              color: shapeData.get("color") as string,
            }),
            ...(shapeData.get("type") === "comment" && {
              text: shapeData.get("text") as string,
              author: shapeData.get("author") as string,
            }),
            ...(shapeData.get("type") === "group" && {
              children:
                (shapeData.get("children") as unknown[] | undefined)?.map((c: unknown) =>
                  (c as { toJSON: () => unknown }).toJSON(),
                ) || [],
              scaleX: shapeData.get("scaleX") as number | undefined,
              scaleY: shapeData.get("scaleY") as number | undefined,
            }),
          } as Shape;

          const existing = useBoardStore.getState().shapes.find((s) => s.id === key);
          if (existing) {
            originalActionsRef.current.updateShape(key, shape);
          } else {
            originalActionsRef.current.addShape(shape);
          }
        }
      });
    };

    const connectionsObserver = () => {
      const newConnections = provider.connections.toArray() as YConnectionData[];
      const currentConns = useBoardStore.getState().connections;
      const currentIds = new Set(currentConns.map((c) => c.id));
      const newIds = new Set(newConnections.map((c) => c.id));

      newConnections.forEach((conn) => {
        if (!currentIds.has(conn.id)) {
          originalActionsRef.current.addConnection(conn as unknown as Connection);
        }
      });

      currentConns.forEach((conn) => {
        if (!newIds.has(conn.id)) {
          originalActionsRef.current.removeConnection(conn.id);
        }
      });
    };

    const awarenessObserver = () => {
      const states = provider.awareness.getStates();
      const localClientId = provider.doc.clientID;

      const cursors: Cursor[] = [];
      states.forEach((state: unknown, clientId: number) => {
        const typedState = state as AwarenessState | undefined;
        if (typedState?.user && typedState?.cursor && clientId !== localClientId) {
          cursors.push({
            id: typedState.user.id,
            x: typedState.cursor.x,
            y: typedState.cursor.y,
            color: typedState.user.color,
            userName: typedState.user.name,
          });
        }
      });

      useBoardStore.setState({ cursors });
    };

    provider.shapes.observe(shapesObserver);
    provider.connections.observe(connectionsObserver);
    provider.awareness.on("update", awarenessObserver);

    // === 2. Zustand → Yjs (отправка локальных изменений) ===

    useBoardStore.setState({
      addShape: (shape: Shape) => {
        originalActionsRef.current.addShape(shape);
        const yMap = new Y.Map<unknown>();
        Object.entries(shape).forEach(([key, value]) => {
          if (key === "children" && Array.isArray(value)) {
            const yArray = new Y.Array<unknown>();
            value.forEach((child) => {
              yArray.push([child]);
            });
            yMap.set(key, yArray);
          } else {
            yMap.set(key, value);
          }
        });
        provider.doc.transact(() => {
          provider.shapes.set(shape.id, yMap);
        }, "local" as unknown);
      },
    });

    useBoardStore.setState({
      updateShape: (id: string, patch: Partial<Shape>) => {
        originalActionsRef.current.updateShape(id, patch);
        const yMap = provider.shapes.get(id) as Y.Map<unknown> | undefined;
        if (yMap) {
          provider.doc.transact(() => {
            Object.entries(patch).forEach(([key, value]) => {
              if (key === "children" && Array.isArray(value)) {
                yMap.delete(key);
                const yArray = new Y.Array<unknown>();
                value.forEach((child) => {
                  yArray.push([child]);
                });
                yMap.set(key, yArray);
              } else {
                yMap.set(key, value);
              }
            });
          }, "local" as unknown);
        }
      },
    });

    useBoardStore.setState({
      removeShape: (id: string) => {
        originalActionsRef.current.removeShape(id);
        provider.doc.transact(() => {
          provider.shapes.delete(id);
        }, "local" as unknown);
      },
    });

    useBoardStore.setState({
      addConnection: (conn: Connection) => {
        originalActionsRef.current.addConnection(conn);
        provider.doc.transact(() => {
          provider.connections.push([conn]);
        }, "local" as unknown);
      },
    });

    useBoardStore.setState({
      removeConnection: (id: string) => {
        originalActionsRef.current.removeConnection(id);
        const index = provider.connections
          .toArray()
          .findIndex((c: unknown) => (c as YConnectionData).id === id);
        if (index !== -1) {
          provider.doc.transact(() => {
            provider.connections.delete(index);
          }, "local" as unknown);
        }
      },
    });

    // === 3. Отслеживание курсора текущего пользователя ===
    const handleMouseMove = (e: MouseEvent) => {
      const stage = document.querySelector(".konvajs-content");
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      provider.awareness.setLocalStateField("cursor", { x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // === ОЧИСТКА ===
    return () => {
      provider.shapes.unobserve(shapesObserver);
      provider.connections.unobserve(connectionsObserver);
      provider.awareness.off("update", awarenessObserver);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [boardId, userId, userName]);

  return { provider: providerRef.current, isReady };
};

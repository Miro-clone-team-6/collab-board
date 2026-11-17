"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { useBoardStore } from "../boardStore";
import { getYjsProvider, YjsSocketProvider } from "../realtime/yjsProvider";
import type { Connection, Cursor, Shape } from "../types";
import type { AwarenessState, YConnectionData } from "../types/yjs.types";

export const useYjsSync = (boardId: string, userId: string, userName: string) => {
  const providerRef = useRef<YjsSocketProvider | null>(null);
  const [isReady, setIsReady] = useState(false);

  const originalActionsRef = useRef({
    addShape: useBoardStore.getState().addShape,
    updateShape: useBoardStore.getState().updateShape,
    removeShape: useBoardStore.getState().removeShape,
    addConnection: useBoardStore.getState().addConnection,
    removeConnection: useBoardStore.getState().removeConnection,
  });

  const shapeObserversRef = useRef<Map<string, (event: Y.YMapEvent<unknown>) => void>>(new Map());

  useEffect(() => {
    const provider = getYjsProvider({ boardId, userId, userName });
    providerRef.current = provider;
    setIsReady(true);

    // === 1. Yjs → Zustand ===
    // biome-ignore lint/suspicious/noExplicitAny: Yjs internal type definition requires 'any' for AbstractType
    const shapesObserver = (events: Y.YEvent<Y.AbstractType<any>>[]) => {
      const firstEvent = events[0];
      if (firstEvent?.transaction?.origin === "local") return;

      events.forEach((event) => {
        if (event.target === provider.shapes) {
          event.changes.keys.forEach((change, key) => {
            if (change.action === "delete") {
              useBoardStore.getState().removeShape(key);
              const observer = shapeObserversRef.current.get(key);
              if (observer) {
                const yMap = provider.shapes.get(key) as Y.Map<unknown> | undefined;
                if (yMap) yMap.unobserve(observer);
                shapeObserversRef.current.delete(key);
              }
            } else if (change.action === "add") {
              const yMap = provider.shapes.get(key) as Y.Map<unknown> | undefined;
              if (!yMap) return;

              const shape = createShapeFromYjs(key, yMap);
              originalActionsRef.current.addShape(shape);

              const shapeObserver = createShapeObserver(key, yMap);
              yMap.observe(shapeObserver);
              shapeObserversRef.current.set(key, shapeObserver);
            }
          });
        } else if (event.path.length > 0) {
          const shapeId = event.path[0] as string;
          const yMap = provider.shapes.get(shapeId) as Y.Map<unknown> | undefined;
          if (!yMap) return;

          const patch: Partial<Shape> = { id: shapeId };
          let hasChanges = false;

          const mapEvent = event as Y.YMapEvent<unknown>;
          mapEvent.changes.keys.forEach((change, key) => {
            if (change.action === "update" || change.action === "add") {
              const value = yMap.get(key);
              if (value !== undefined) {
                (patch as Record<string, unknown>)[key] = value;
                hasChanges = true;
              }
            }
          });

          if (hasChanges) {
            originalActionsRef.current.updateShape(shapeId, patch);
          }
        }
      });
    };

    const createShapeObserver = (shapeId: string, yMap: Y.Map<unknown>) => {
      return (event: Y.YMapEvent<unknown>) => {
        if (event.transaction.origin === "local") return;

        const patch: Partial<Shape> = { id: shapeId };
        let hasChanges = false;

        event.changes.keys.forEach((change, key) => {
          if (change.action === "update" || change.action === "add") {
            const value = yMap.get(key);
            if (value !== undefined) {
              (patch as Record<string, unknown>)[key] = value;
              hasChanges = true;
            }
          }
        });

        if (hasChanges) {
          originalActionsRef.current.updateShape(shapeId, patch);
        }
      };
    };

    const createShapeFromYjs = (id: string, yMap: Y.Map<unknown>): Shape => {
      const type = (yMap.get("type") as string) || "rect";
      const base = {
        id,
        type,
        x: (yMap.get("x") as number) || 0,
        y: (yMap.get("y") as number) || 0,
        rotation: (yMap.get("rotation") as number) || 0,
        fill: yMap.get("fill") as string | undefined,
        stroke: yMap.get("stroke") as string | undefined,
        strokeWidth: yMap.get("strokeWidth") as number | undefined,
      };

      switch (type) {
        case "circle":
          return { ...base, type: "circle", radius: (yMap.get("radius") as number) || 50 } as Shape;
        case "text":
          return {
            ...base,
            type: "text",
            text: (yMap.get("text") as string) || "",
            fontSize: (yMap.get("fontSize") as number) || 16,
            width: (yMap.get("width") as number) || 100,
          } as Shape;
        case "sticky":
          return {
            ...base,
            type: "sticky",
            text: (yMap.get("text") as string) || "",
            width: (yMap.get("width") as number) || 200,
            height: (yMap.get("height") as number) || 200,
            color: (yMap.get("color") as string) || "#fef3c7",
          } as Shape;
        case "comment":
          return {
            ...base,
            type: "comment",
            text: (yMap.get("text") as string) || "",
            author: (yMap.get("author") as string) || "Аноним",
          } as Shape;
        case "image":
          return {
            ...base,
            type: "image",
            src: (yMap.get("src") as string) || "",
            width: (yMap.get("width") as number) || 200,
            height: (yMap.get("height") as number) || 200,
          } as Shape;
        case "group": {
          const rawChildren = yMap.get("children");
          const children =
            rawChildren instanceof Y.Array
              ? (rawChildren.toArray() as unknown[])
              : Array.isArray(rawChildren)
                ? rawChildren
                : [];
          return {
            ...base,
            type: "group",
            children,
            scaleX: yMap.get("scaleX") as number | undefined,
            scaleY: yMap.get("scaleY") as number | undefined,
          } as Shape;
        }
        default:
          return {
            ...base,
            type: "rect",
            width: (yMap.get("width") as number) || 100,
            height: (yMap.get("height") as number) || 100,
          } as Shape;
      }
    };

    const initializeExistingShapes = () => {
      provider.shapes.forEach((yMap, key) => {
        const shapeYMap = yMap as Y.Map<unknown>;
        const shape = createShapeFromYjs(key, shapeYMap);
        originalActionsRef.current.addShape(shape);
        const shapeObserver = createShapeObserver(key, shapeYMap);
        shapeYMap.observe(shapeObserver);
        shapeObserversRef.current.set(key, shapeObserver);
      });
    };

    const connectionsObserver = () => {
      const newConnections = provider.connections.toArray() as YConnectionData[];
      const currentConns = useBoardStore.getState().connections;
      const currentIds = new Set(currentConns.map((c) => c.id));
      const newIds = new Set(newConnections.map((c) => c.id));

      newConnections.forEach((conn) => {
        if (!currentIds.has(conn.id))
          originalActionsRef.current.addConnection(conn as unknown as Connection);
      });
      currentConns.forEach((conn) => {
        if (!newIds.has(conn.id)) originalActionsRef.current.removeConnection(conn.id);
      });
    };

    // 🔥 ИСПРАВЛЕНО 1: Сравнение через Map для 100% защиты от heartbeat-дрожания
    const awarenessObserver = () => {
      const states = provider.awareness.getStates();
      const localClientId = provider.doc.clientID;

      // Собираем новые данные в Map для быстрого поиска по ID
      const newCursorsMap = new Map<string, Cursor>();
      states.forEach((state: unknown, clientId: number) => {
        const typedState = state as AwarenessState | undefined;
        if (typedState?.user && typedState?.cursor && clientId !== localClientId) {
          newCursorsMap.set(`cursor-${clientId}`, {
            id: `cursor-${clientId}`,
            x: Math.round(typedState.cursor.x), // Округление убирает субпиксельный шум
            y: Math.round(typedState.cursor.y),
            color: typedState.user.color,
            userName: typedState.user.name,
          });
        }
      });

      const currentCursors = useBoardStore.getState().cursors;

      // Быстрая проверка количества
      if (currentCursors.length !== newCursorsMap.size) {
        useBoardStore.setState({ cursors: Array.from(newCursorsMap.values()) });
        return;
      }

      // Глубокая проверка: изменились ли координаты или цвета хотя бы у одного курсора
      let hasChanges = false;
      for (const [id, newC] of newCursorsMap) {
        const oldC = currentCursors.find((c) => c.id === id);
        if (
          !oldC ||
          oldC.x !== newC.x ||
          oldC.y !== newC.y ||
          oldC.color !== newC.color ||
          oldC.userName !== newC.userName
        ) {
          hasChanges = true;
          break;
        }
      }

      // Вызываем setState ТОЛЬКО если данные реально изменились
      if (hasChanges) {
        useBoardStore.setState({ cursors: Array.from(newCursorsMap.values()) });
      }
    };

    // 🔥 Подписки
    provider.shapes.observeDeep(shapesObserver);
    initializeExistingShapes();
    provider.connections.observe(connectionsObserver);
    provider.awareness.on("update", awarenessObserver);

    // === 2. Zustand → Yjs ===

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

    // === 3. Курсор ===
    let lastCursorUpdate = 0;
    let lastSentX = -1000;
    let lastSentY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (document.hidden) return;

      const now = Date.now();
      if (now - lastCursorUpdate < 50) return;

      const stage = document.querySelector(".konvajs-content") as HTMLElement | null;
      if (!stage) return;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Мертвая зона: игнорируем микро-движения менее 1 пикселя
      if (Math.abs(x - lastSentX) < 1 && Math.abs(y - lastSentY) < 1) {
        return;
      }

      lastSentX = x;
      lastSentY = y;
      lastCursorUpdate = now;

      provider.awareness.setLocalStateField("cursor", { x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 🔥 Очистка
    return () => {
      // 🔥 ИСПРАВЛЕНО 2: Явно удаляем своё состояние awareness при закрытии/перезагрузке вкладки.
      // Это заставляет курсор исчезнуть НЕМЕДЛЕННО, а не висеть 30 секунд до таймаута Yjs.
      provider.awareness.setLocalState(null);

      provider.shapes.unobserveDeep(shapesObserver);
      shapeObserversRef.current.forEach((observer, key) => {
        const yMap = provider.shapes.get(key) as Y.Map<unknown> | undefined;
        if (yMap) yMap.unobserve(observer);
      });
      shapeObserversRef.current.clear();
      provider.connections.unobserve(connectionsObserver);
      provider.awareness.off("update", awarenessObserver);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [boardId, userId, userName]);

  return { provider: providerRef.current, isReady };
};

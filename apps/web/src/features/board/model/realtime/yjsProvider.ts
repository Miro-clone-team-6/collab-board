"use client";

import { nanoid } from "nanoid";
import { io, Socket } from "socket.io-client";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export interface YjsConfig {
  boardId: string;
  serverUrl?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
}

export class YjsSocketProvider {
  public doc: Y.Doc;
  public shapes: Y.Map<unknown>;
  public connections: Y.Array<unknown>;
  public undoManager: Y.UndoManager;
  public awareness: Awareness;

  private socket: Socket;
  public config: YjsConfig;
  //private isSynced = false;

  constructor(config: YjsConfig) {
    this.config = config;
    this.doc = new Y.Doc();

    this.shapes = this.doc.getMap<unknown>("shapes");
    this.connections = this.doc.getArray<unknown>("connections");

    this.undoManager = new Y.UndoManager([this.shapes, this.connections], {
      captureTimeout: 500,
      trackedOrigins: new Set(["local"]),
    });

    this.awareness = new Awareness(this.doc);

    this.awareness.setLocalStateField("user", {
      id: config.userId || nanoid(),
      name: config.userName || `User ${Math.floor(Math.random() * 1000)}`,
      color: config.userColor || this.randomColor(),
    });

    this.socket = io(config.serverUrl || "http://localhost:3001", {
      transports: ["websocket"],
      query: { boardId: config.boardId },
    });

    this.setupListeners();
  }
  // 🔥 Вспомогательный метод для безопасной конвертации в Uint8Array
  private toUint8Array(data: unknown): Uint8Array {
    if (data instanceof Uint8Array) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }
    // На случай, если Socket.IO передал Buffer (Node.js)
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
      return new Uint8Array(data);
    }
    throw new Error("Invalid binary data received from server");
  }
  private randomColor() {
    const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private setupListeners() {
    this.socket.on("connect", () => {
      console.log("✅ Connected to Yjs server");
      const stateVector = Y.encodeStateVector(this.doc);
      this.socket.emit("yjs-sync-request", stateVector);
    });

    this.socket.on("yjs-sync", (update: unknown) => {
      // 🔥 ИСПРАВЛЕНО: Гарантируем, что данные — это Uint8Array
      const binaryUpdate = this.toUint8Array(update);
      Y.applyUpdate(this.doc, binaryUpdate, "socketio");
    });

    this.socket.on("yjs-update", (update: unknown) => {
      // 🔥 ИСПРАВЛЕНО: Гарантируем, что данные — это Uint8Array
      const binaryUpdate = this.toUint8Array(update);
      Y.applyUpdate(this.doc, binaryUpdate, "socketio");
    });

    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin !== "socketio") {
        this.socket.emit("yjs-update", update);
      }
    });

    this.awareness.on(
      "update",
      ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
        const changedClients = added.concat(updated, removed);
        const awarenessStates = changedClients.map((clientId: number) => [
          clientId,
          this.awareness.getStates().get(clientId),
        ]);
        this.socket.emit("awareness-update", awarenessStates);
      },
    );

    // 🔥 ИСПРАВЛЕНО: Принимаем unknown, затем безопасно приводим к типу кортежа
    this.socket.on("awareness-update", (updates: unknown) => {
      const typedUpdates = updates as [number, Record<string, unknown> | null][];
      const states = this.awareness.getStates();

      const added: number[] = [];
      const updated: number[] = [];
      const removed: number[] = [];

      typedUpdates.forEach(([clientId, state]) => {
        if (state === null) {
          if (states.has(clientId)) {
            states.delete(clientId);
            removed.push(clientId);
          }
        } else {
          if (states.has(clientId)) {
            updated.push(clientId);
          } else {
            added.push(clientId);
          }
          states.set(clientId, state);
        }
      });

      // 🔥 ИСПРАВЛЕНО:
      // 1. Второй аргумент ДОЛЖЕН быть массивом (как требует lib0/observable).
      // 2. Мы передаем ровно 2 аргумента, убирая лишний 'this' в конце.
      if (added.length > 0 || updated.length > 0 || removed.length > 0) {
        this.awareness.emit("update", [{ added, updated, removed }]);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from Yjs server");
      //this.isSynced = false;
    });
  }

  public undo() {
    this.undoManager.undo();
  }

  public redo() {
    this.undoManager.redo();
  }

  public destroy() {
    this.socket.disconnect();
    this.undoManager.destroy();
    this.awareness.destroy();
    this.doc.destroy();
  }
}

let globalProvider: YjsSocketProvider | null = null;

export const getYjsProvider = (config: YjsConfig) => {
  if (!globalProvider || globalProvider.config.boardId !== config.boardId) {
    if (globalProvider) {
      globalProvider.destroy();
    }
    globalProvider = new YjsSocketProvider(config);
  }
  return globalProvider;
};

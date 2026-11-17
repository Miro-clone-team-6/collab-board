import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import * as Y from "yjs";

// Строгий тип для состояния awareness
type AwarenessState = Record<string, unknown> | null;

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:3000", "http://172.16.219.2:3000", "https://*.vercel.app"],
    credentials: true,
  },
})
export class WhiteboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Храним Y.Doc для каждой доски в памяти
  private docs = new Map<string, Y.Doc>();

  // Храним awareness-состояния: boardId -> (yjsClientId -> state)
  private awareness = new Map<string, Map<number, AwarenessState>>();

  handleConnection(client: Socket) {
    const boardId = client.handshake.query.boardId as string | undefined;
    if (!boardId) return;

    client.join(boardId);
    console.log(`✅ Client ${client.id} joined board: ${boardId}`);

    if (!this.docs.has(boardId)) {
      this.docs.set(boardId, new Y.Doc());
      this.awareness.set(boardId, new Map());
    }

    const doc = this.docs.get(boardId);
    if (doc) {
      client.emit("yjs-sync", Y.encodeStateAsUpdate(doc));
    }
  }

  handleDisconnect(client: Socket) {
    const boardId = client.handshake.query.boardId as string | undefined;
    console.log(`❌ Client ${client.id} disconnected from board: ${boardId}`);

    if (!boardId) return;

    const boardAwareness = this.awareness.get(boardId);
    if (!boardAwareness) return;

    // 🔥 ИСПРАВЛЕНО: Находим и удаляем состояние этого клиента из awareness
    // Это гарантирует, что курсор исчезнет у всех остальных клиентов
    const yjsClientId = client.data?.yjsClientId;
    if (yjsClientId !== undefined) {
      boardAwareness.delete(yjsClientId);

      // Рассылаем обновление всем остальным клиентам
      const updates: [number, AwarenessState][] = [[yjsClientId, null]];
      client.to(boardId).emit("awareness-update", updates);
    }
  }

  @SubscribeMessage("yjs-sync-request")
  handleSyncRequest(@ConnectedSocket() client: Socket, @MessageBody() stateVector: Uint8Array) {
    const boardId = client.handshake.query.boardId as string | undefined;
    const doc = boardId ? this.docs.get(boardId) : undefined;

    if (doc) {
      const update = Y.encodeStateAsUpdate(doc, stateVector);
      client.emit("yjs-sync", update);
    }
  }

  // 🔥 ИСПРАВЛЕНО: Убран лишний символ @
  @SubscribeMessage("yjs-update")
  handleYjsUpdate(@ConnectedSocket() client: Socket, @MessageBody() update: unknown) {
    const boardId = client.handshake.query.boardId as string | undefined;
    if (!boardId) return;

    const doc = this.docs.get(boardId);
    if (!doc) return;

    // 🔥 Безопасно конвертируем входящие данные в Uint8Array
    const binaryUpdate = this.toUint8Array(update);

    // Применяем обновление к документу на сервере
    Y.applyUpdate(doc, binaryUpdate, "socketio");

    // Рассылаем это обновление всем остальным клиентам в комнате
    client.to(boardId).emit("yjs-update", binaryUpdate);
  }

  // 🔥 Вспомогательный метод для гарантированной конвертации в Uint8Array
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
    // Проверка на Node.js Buffer (Socket.IO иногда передает данные в этом формате)
    if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    throw new Error(`Invalid binary data received from client. Type: ${typeof data}`);
  }

  @SubscribeMessage("awareness-update")
  handleAwarenessUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() updates: [number, AwarenessState][],
  ) {
    const boardId = client.handshake.query.boardId as string | undefined;
    if (!boardId) return;

    const boardAwareness = this.awareness.get(boardId);
    if (!boardAwareness) return;

    updates.forEach(([clientId, state]) => {
      if (state === null) {
        boardAwareness.delete(clientId);
      } else {
        boardAwareness.set(clientId, state);
      }
    });

    client.to(boardId).emit("awareness-update", updates);
  }
}

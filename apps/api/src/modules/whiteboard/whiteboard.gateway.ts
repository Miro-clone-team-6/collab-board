// src/modules/whiteboard/whiteboard.gateway.ts
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

// Строгий тип для состояния awareness вместо any
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
    // Yjs автоматически очистит состояние этого клиента на других машинах через свой внутренний механизм таймаутов.
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

  @SubscribeMessage("yjs-update")
  handleYjsUpdate(@ConnectedSocket() client: Socket, @MessageBody() update: Uint8Array) {
    const boardId = client.handshake.query.boardId as string | undefined;
    if (!boardId) return;
    const doc = boardId ? this.docs.get(boardId) : undefined;

    if (doc) {
      // Применяем обновление с origin 'socketio'
      Y.applyUpdate(doc, update, "socketio");

      // Рассылаем обновление всем ОСТАЛЬНЫМ клиентам в этой комнате
      client.to(boardId).emit("yjs-update", update);
    }
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

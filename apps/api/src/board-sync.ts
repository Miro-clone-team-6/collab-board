import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { BoardSyncGateway } from "./modules/boards/board-sync.gateway.js";

// Синхронизация доски запускается отдельно от HTTP-модулей и Prisma.
@Module({ providers: [BoardSyncGateway] })
class BoardSyncModule {}

const app = await NestFactory.create(BoardSyncModule);
app.useWebSocketAdapter(new WsAdapter(app));
app.enableShutdownHooks();
await app.listen(3001, "127.0.0.1");
console.log("Синхронизация доски доступна на ws://127.0.0.1:3001/board-sync");

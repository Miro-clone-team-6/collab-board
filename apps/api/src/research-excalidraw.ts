import "reflect-metadata";
import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WsAdapter } from "@nestjs/platform-ws";
import { ExcalidrawGateway } from "./modules/research-excalidraw/excalidraw.gateway.js";

// Reuse the same Nest gateway without bootstrapping Prisma or the HTTP modules.
@Module({ providers: [ExcalidrawGateway] })
class ResearchExcalidrawModule {}

const app = await NestFactory.create(ResearchExcalidrawModule);
app.useWebSocketAdapter(new WsAdapter(app));
app.enableShutdownHooks();
await app.listen(3001, "127.0.0.1");
console.log("Excalidraw research room: ws://127.0.0.1:3001/research/excalidraw");

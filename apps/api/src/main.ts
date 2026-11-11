import "reflect-metadata";
import type { ConfigType } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { httpConfig } from "./config/http.config";
import { configureApp } from "./configure-app";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const { port, isProduction } = app.get<ConfigType<typeof httpConfig>>(httpConfig.KEY);
  await app.listen(port);
  console.log(`🚀 API сервер запущен на: http://localhost:${port}/api/v1`);
  if (!isProduction) {
    console.log(`📑 Документация Swagger: http://localhost:${port}/docs`);
  }
}

bootstrap();

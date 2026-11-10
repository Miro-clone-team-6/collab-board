import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./configure-app";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`🚀 API сервер запущен на: http://localhost:${port}/api/v1`);
  console.log(`📑 Документация Swagger: http://localhost:${port}/docs`);
}

bootstrap();

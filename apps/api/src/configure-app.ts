import type { INestApplication } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { httpConfig } from "./config/http.config.js";

export function configureApp(app: INestApplication): void {
  const { isProduction, allowedOrigins } = app.get<ConfigType<typeof httpConfig>>(httpConfig.KEY);

  app.setGlobalPrefix("api/v1");

  // В dev CSP отключён, иначе не работают скрипты Swagger UI.
  app.use(helmet(isProduction ? {} : { contentSecurityPolicy: false }));

  app.use(cookieParser());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle("CollabBoard API")
      .setDescription("REST API бэкенда интерактивной доски совместной работы")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, cleanupOpenApiDoc(document));
  }

  app.enableShutdownHooks();
}

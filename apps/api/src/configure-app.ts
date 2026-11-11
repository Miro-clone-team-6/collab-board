import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { cleanupOpenApiDoc } from "nestjs-zod";

export function configureApp(app: INestApplication): void {
  const isProduction = process.env.NODE_ENV === "production";

  app.setGlobalPrefix("api/v1");

  // В dev CSP отключён, иначе не работают скрипты Swagger UI.
  app.use(helmet(isProduction ? {} : { contentSecurityPolicy: false }));

  app.use(cookieParser());

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : [];

  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.FRONTEND_URL || "",
      process.env.NEXT_PUBLIC_APP_URL || "",
      ...allowedOrigins,
    ].filter(Boolean),
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

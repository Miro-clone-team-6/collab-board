import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { stringify as stringifyYaml } from "yaml";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/configure-app";

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle("CollabBoard API")
    .setDescription("Спецификация API интерактивной доски")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outDir = resolve(__dirname, "..", "openapi");

  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "openapi.json"), JSON.stringify(document, null, 2));
  writeFileSync(resolve(outDir, "openapi.yaml"), stringifyYaml(document));

  await app.close();
  console.log("✅ OpenAPI спецификация успешно сохранена в apps/api/openapi/openapi.json");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { databaseConfig } from "./config/database.config.js";
import { envFilePath } from "./config/env-file.js";
import { httpConfig } from "./config/http.config.js";
import { HttpExceptionFilter } from "./errors/http-exception.filter.js";
import { HealthModule } from "./modules/health/health.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [databaseConfig, httpConfig],
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: HttpExceptionFilter }],
})
export class AppModule {}

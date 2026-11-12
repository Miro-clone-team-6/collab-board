import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { databaseConfig } from "./config/database.config.js";
import { envFilePath } from "./config/env-file.js";
import { httpConfig } from "./config/http.config.js";
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
})
export class AppModule {}

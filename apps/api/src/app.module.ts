import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { databaseConfig } from "./config/database.config";
import { envFilePath } from "./config/env-file";
import { httpConfig } from "./config/http.config";
import { HealthModule } from "./modules/health/health.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

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

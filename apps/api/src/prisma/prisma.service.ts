import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import { databaseConfig } from "../config/database.config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) database: ConfigType<typeof databaseConfig>) {
    super({ datasourceUrl: database.url });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

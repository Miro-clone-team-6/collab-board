import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { databaseConfig } from "../config/database.config.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { createPrismaAdapter } from "./prisma.adapter.js";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) database: ConfigType<typeof databaseConfig>) {
    super({ adapter: createPrismaAdapter(database.url) });
  }

  async onModuleInit(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

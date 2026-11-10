import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      // Allow app to initialize and run headless tools (like OpenAPI generation) when DB is offline
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

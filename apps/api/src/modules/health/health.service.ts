import { Injectable } from "@nestjs/common";
import type { HealthResponse } from "@packages/contracts";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthResponse> {
    let database: HealthResponse["database"] = "connected";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "disconnected";
    }

    return {
      status: database === "connected" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database,
    };
  }
}

import { ApiProperty } from "@nestjs/swagger";

export class HealthResponseDto {
  @ApiProperty({ example: "ok" })
  status!: string;

  @ApiProperty({ example: "2026-11-10T10:00:00.000Z" })
  timestamp!: string;

  @ApiProperty({ example: 42.5 })
  uptime!: number;

  @ApiProperty({ enum: ["connected", "disconnected"], example: "connected" })
  database!: "connected" | "disconnected";
}

import { HealthResponseSchema } from "@packages/contracts";
import { createZodDto } from "nestjs-zod";

export class HealthResponseDto extends createZodDto(HealthResponseSchema) {}

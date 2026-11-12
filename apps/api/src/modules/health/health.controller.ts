import { Controller, Get, HttpStatus, Res, UseInterceptors } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { Response } from "express";
import { ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { HealthService } from "./health.service.js";
import { HealthResponseDto } from "./health-response.dto.js";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @UseInterceptors(ZodSerializerInterceptor)
  @ZodSerializerDto(HealthResponseDto)
  @ApiOperation({ summary: "API and services check" })
  @ApiOkResponse({
    description: "Healthy",
    type: HealthResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: "Partially healthy",
    type: HealthResponseDto,
  })
  async check(@Res({ passthrough: true }) response: Response): Promise<HealthResponseDto> {
    const health = await this.healthService.check();
    response.status(health.status === "ok" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return health;
  }
}

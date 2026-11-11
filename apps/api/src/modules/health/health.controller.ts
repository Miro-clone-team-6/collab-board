import { Controller, Get, UseInterceptors } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ZodSerializerDto, ZodSerializerInterceptor } from "nestjs-zod";
import { HealthService } from "./health.service";
import { HealthResponseDto } from "./health-response.dto";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @UseInterceptors(ZodSerializerInterceptor)
  @ZodSerializerDto(HealthResponseDto)
  @ApiOperation({ summary: "Проверка работоспособности сервиса" })
  @ApiOkResponse({ description: "Сервис доступен и функционирует штатно", type: HealthResponseDto })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}

import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthResponseDto } from "./dto/health-response.dto";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Проверка работоспособности сервиса" })
  @ApiResponse({
    status: 200,
    description: "Сервис доступен и функционирует штатно",
    type: HealthResponseDto,
  })
  @ApiOkResponse({ description: "Сервис доступен и функционирует штатно", type: HealthResponseDto })
  check(): Promise<HealthResponseDto> {
    return this.healthService.check();
  }
}

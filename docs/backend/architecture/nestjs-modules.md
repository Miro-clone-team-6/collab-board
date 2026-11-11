# ⚙️ Архитектура модулей NestJS API (`apps/api`)

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

API построено на базе фреймворка **NestJS 11** и следует принципам модульной архитектуры, разделения слоев (Separation of Concerns) и внедрения зависимостей (Dependency Injection).

---

## 1. Структура слоев в модуле

Каждый функциональный домен API оформляется в виде изолированного модуля в `apps/api/src/modules/<module-name>/`:

```text
apps/api/src/modules/<module-name>/
├── <module-name>.controller.ts    # HTTP-слой: эндпоинты, Swagger-декораторы, статус-коды
├── <module-name>.service.ts       # Бизнес-логика: правила, оркестрация, вызовы Prisma
├── <module-name>.module.ts        # Определение модуля (imports, controllers, providers, exports)
└── dto/                           # Локальные DTO (если не вынесены в @packages/dto)
```

---

## 2. Разделение обязанностей между слоями

### 1. Контроллер (`Controller`) — Тонкий HTTP-слой
* **Обязанности:** Прием запроса, вызов сервиса, Swagger-декораторы `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, возвращение результата.
* 🚫 **Строго запрещено:** Писать бизнес-логику, вызывать `PrismaService` напрямую в контроллере.

```typescript
@ApiTags("Boards")
@Controller("boards")
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get(":id")
  @ApiOperation({ summary: "Получение доски по ID" })
  @ApiResponse({ status: 200, description: "Доска найдена" })
  @ApiResponse({ status: 404, description: "Доска не найдена" })
  async getBoard(@Param("id") id: string) {
    return this.boardsService.findById(id);
  }
}
```

### 2. Сервис (`Service`) — Слой бизнес-логики
* **Обязанности:** Вся бизнес-логика приложения, валидация бизнес-правил, запросы к PostgreSQL через `PrismaService`, работа с Redis, выброс типизированных `NotFoundException`, `BadRequestException`.

```typescript
@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException(`Доска с ID ${id} не найдена`);
    }

    return board;
  }
}
```

---

## 3. Валидация входных данных через Zod (`@packages/dto`)

Вместо устаревшего `class-validator` проект использует **Zod** и общий пакет `@packages/dto`.  
Это гарантирует 100% согласованность типов и схем валидации между фронтендом и бэкендом:

1. Схема описывается в `packages/dto/src/index.ts`:
   ```typescript
   export const CreateBoardSchema = z.object({
     title: z.string().min(1, "Название обязательно"),
   });
   export type CreateBoardDto = z.infer<typeof CreateBoardSchema>;
   ```
2. Пакет собирается через `@rslib/core` в CommonJS (`dist/index.cjs`), что позволяет NestJS мгновенно импортировать типы без проблем с ESM.

---

## 4. Глобальная конфигурация (`configure-app.ts`)

Вся конфигурация приложения вынесена в чистую функцию `configureApp(app)`:
* **Глобальный префикс:** `/api/v1` для всех роутов.
* **Helmet:** Защитные HTTP-заголовки. В dev-режиме CSP ослабляется для работы веб-интерфейса Swagger UI (`/docs`).
* **CORS:** Разрешает запросы только с `http://localhost:3000` с поддержкой кук (`credentials: true`).
* **Cookie-Parser:** Для работы с авторизационными сессиями и refresh-токенами.
* **Graceful Shutdown:** Перехват сигналов завершения процессов для закрытия соединений с PostgreSQL.

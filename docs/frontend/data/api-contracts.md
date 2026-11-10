# 📡 API Contracts, Swagger & Кодогенерация (@packages/api)

Backend REST API (`apps/api`) является **единственным источником истины** для всех контрактов данных.  
Ручное дублирование API-типов, эндпоинтов и интерфейсов на фронтенде **строго запрещено**.

Все TypeScript-модели DTO, API-функции и хуки **TanStack Query v5** генерируются автоматически из схемы OpenAPI (Swagger), формируемой бэкендом, с помощью утилиты **Orval** в единый общий пакет `@packages/api`.

---

## ⚡ Быстрый старт: Обновление API-контрактов для фронтенда

Когда бэкенд добавил новые эндпоинты или изменил существующие, выполните команду кодогенерации в корне проекта:

### Вариант 1. Полный цикл одной командой (Рекомендуется)

Выполните в корне репозитория:
```bash
pnpm codegen
```
* **Что делает:** Последовательно запускает `pnpm run generate:api` и `pnpm run generate:client`.

---

### Вариант 2. Пошаговое выполнение

#### Шаг 1. Сгенерировать актуальную схему Swagger / OpenAPI из бэкенда
```bash
pnpm generate:api
```
* **Что делает:** Поднимает контекст NestJS в изолированном headless-режиме (скрипт `scripts/generate-openapi.ts`) и сохраняет актуальную JSON-спецификацию в:
  `apps/api/openapi/openapi.json`.
* 💡 **Важно:** Для этой команды **НЕ требуется запущенный Docker, PostgreSQL или Redis**. Генерация схемы работает полностью автономно в памяти на любой ОС (Windows, macOS, Linux).

#### Шаг 2. Сгенерировать клиент Orval и хуки TanStack Query v5
```bash
pnpm generate:client
```
* **Что делает:** Orval CLI читает `apps/api/openapi/openapi.json`, группирует эндпоинты по тегам (`mode: "tags-split"`) и генерирует типизированный клиент в:
  - `packages/api/src/generated/endpoints/` (контроллеры, функции запросов, хуки TanStack Query v5, фабрики ключей `getQueryKey`)
  - `packages/api/src/generated/model/` (DTO и интерфейсы схем)

#### Шаг 3. Проверить изменения типов в веб-приложении
```bash
pnpm typecheck
```
Если на бэкенде изменился контракт (например, поле переименовалось или стало обязательным), компилятор TypeScript сразу покажет точные строки кода в `apps/web`, где требуется исправление.

---

## 💻 Как использовать сгенерированный клиент в коде (`apps/web`)

Все сгенерированные сущности доступны через общий пакет `@packages/api`.

### 1. Использование хуков TanStack Query v5 (Мутации)

Хуки мутаций и запросов генерируются Orval автоматически и не требуют ручного написания сетевых вызовов `fetch`:

```tsx
// features/create-board/ui/CreateBoardModal.tsx
import { useBoardsControllerCreateBoard } from "@packages/api";
import type { CreateBoardDto } from "@packages/dto";

export function CreateBoardModal() {
  const createBoardMutation = useBoardsControllerCreateBoard({
    mutation: {
      onSuccess: (data) => {
        console.log("Доска успешно создана:", data.id);
      },
      onError: (error) => {
        console.error("Ошибка при создании доски:", error);
      },
    },
  });

  const onSubmit = (formData: CreateBoardDto) => {
    createBoardMutation.mutate({ data: formData });
  };

  return (
    <button
      onClick={() => onSubmit({ title: "Архитектурная схема", workspaceId: "uuid" })}
      disabled={createBoardMutation.isPending}
    >
      {createBoardMutation.isPending ? "Создание..." : "Создать"}
    </button>
  );
}
```

### 2. Запросы данных и фабрики ключей (Query Keys)

Для запросов данных используйте готовые хуки `use*Controller*` и сгенерированные функции фабрик ключей:

```tsx
// entities/board/ui/BoardList.tsx
import {
  useBoardsControllerFindAll,
  getBoardsControllerFindAllQueryKey,
} from "@packages/api";
import { useQueryClient } from "@tanstack/react-query";

export function BoardList() {
  const queryClient = useQueryClient();
  const { data: boards, isLoading } = useBoardsControllerFindAll();

  const handleRefresh = () => {
    // Инвалидация кэша через сгенерированную фабрику ключей
    queryClient.invalidateQueries({
      queryKey: getBoardsControllerFindAllQueryKey(),
    });
  };

  if (isLoading) return <div>Загрузка досок...</div>;

  return (
    <div>
      <button onClick={handleRefresh}>Обновить список</button>
      <ul>
        {boards?.map((board) => (
          <li key={board.id}>{board.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3. Маппинг DTO к UI-моделям (в слое `entities`)

Не прокидывайте сырые сетевые DTO из API напрямую в глубокие презентационные компоненты холста. Преобразуйте сетевые данные в UI-модели на границе слоя `entities`:

```ts
// entities/board/model/mappers.ts
import type { BoardResponseDto } from "@packages/api";
import type { BoardCardModel } from "./types";

export function mapBoardDtoToCard(dto: BoardResponseDto): BoardCardModel {
  return {
    id: dto.id,
    title: dto.title || "Безымянная доска",
    updatedAtFormatted: new Date(dto.updatedAt).toLocaleDateString("ru-RU"),
    thumbnailUrl: dto.thumbnailUrl ?? "/placeholders/empty-board.svg",
  };
}
```

---

## 🔌 Архитектура транспорта (`packages/api/src/transport.ts`)

Пакет `@packages/api` не зависит от `apps/web` (Принцип монорепозитория: `packages/*` не импортируют `apps/*`).

Связывание происходит через кастомный инстанс транспорта:
1. Все вызовы Orval проходят через функцию `customInstance` в `packages/api/src/transport.ts`.
2. Функция автоматически:
   - Подставляет базовый URL (`process.env.NEXT_PUBLIC_API_URL` или `http://localhost:3001`);
   - Передает `credentials: "include"` для передачи HttpOnly-кук авторизации и сессий;
   - Сериализует тело запроса в JSON;
   - Перехватывает ответы с кодами ошибок (4xx, 5xx) и возвращает типизированную ошибку с сообщением от сервера.

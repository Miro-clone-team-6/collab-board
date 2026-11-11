# ⚡ TanStack Query (Server State)

> **Статус:** 🚧 На пересмотре — может описывать то, чего нет в коде. Источник правды — код и [architecture.md](../../architecture.md).

Для управления серверным состоянием (кэширование, фоновая ревалидация, инвалидация кэша) в веб-приложении `apps/web` используется **TanStack Query v5**.  
Официальная документация: [https://tanstack.com/query/latest](https://tanstack.com/query/latest)

---

## 1. Где находится инфраструктура TanStack Query?

* **Инициализация QueryClient и React Provider:** `apps/web/src/app/providers/QueryProvider.tsx`.
* **Подключение в корневой Layout:** `apps/web/src/app/layout.tsx` (через общий `AppProviders.tsx`).
* **Сгенерированные хуки запросов и мутаций:** `@packages/api` (генерируются Orval автоматически).

---

## 2. Ключи запросов (Query Keys)

Чтобы избежать опечаток и путаницы при инвалидации кэша:

### Фабрики ключей из `@packages/api` (Рекомендуется)
Orval генерирует готовые функции фабрик ключей для каждого эндпоинта:
```ts
import {
  getBoardsControllerFindAllQueryKey,
  getHealthControllerCheckQueryKey,
} from "@packages/api";

// Возвращает стабильный массив ключа: ['/api/v1/boards']
const boardsKey = getBoardsControllerFindAllQueryKey();
```

---

## 3. Пример использования сгенерированных хуков из `@packages/api`

Вместо рукописных вызовов `fetch` используются типизированные хуки:

### Мутация с инвалидацией кэша:
```tsx
// features/create-board/model/use-create-board.ts
import {
  useBoardsControllerCreateBoard,
  getBoardsControllerFindAllQueryKey,
} from "@packages/api";
import { useQueryClient } from "@tanstack/react-query";

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useBoardsControllerCreateBoard({
    mutation: {
      onSuccess: () => {
        // Инвалидируем кэш списка досок для автоматической перезагрузки
        queryClient.invalidateQueries({
          queryKey: getBoardsControllerFindAllQueryKey(),
        });
      },
    },
  });
}
```

### Запрос данных (Query):
```tsx
// entities/board/ui/BoardList.tsx
import { useBoardsControllerFindAll } from "@packages/api";

export function BoardList() {
  const { data: boards, isLoading, error } = useBoardsControllerFindAll();

  if (isLoading) return <div>Загрузка досок...</div>;
  if (error) return <div>Ошибка загрузки списка досок</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {boards?.map((board) => (
        <div key={board.id} className="p-4 border rounded-lg bg-card">
          <h3 className="font-semibold">{board.title}</h3>
        </div>
      ))}
    </div>
  );
}
```

> ❌ **Строго запрещено:** Копировать данные, полученные из `useQuery`, в глобальный `Zustand` store. `useQuery` сам по себе является реактивным источником истины для серверных данных.

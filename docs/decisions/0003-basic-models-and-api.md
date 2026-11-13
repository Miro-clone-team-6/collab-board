# 0003. Модели User и Board и REST API для MVP

- **Статус:** 💬 Обсуждается
- **Дата:** 2026-11-13
- **Issue:** [#20](https://github.com/Miro-clone-team-6/collab-board/issues/20)

## Контекст

В Prisma есть [модель User](../../apps/api/prisma/schema/models/user.prisma). Список досок использует [заглушку](../../apps/web/src/entities/board/api/get-boards.ts). Для MVP предлагаем контракт регистрации, работы со своим профилем и CRUD своих досок.

## Модели

| Модель | Поля и ограничения |
| --- | --- |
| `User` | `id` UUID, уникальный `email`, nullable `name` и `avatarUrl`, `createdAt`, `updatedAt`. Для входа по паролю добавить `passwordHash`, nullable для существующих записей. |
| `Board` | `id` UUID, `title`, `ownerId` FK → `User.id` с индексом, `updatedAt`, nullable `deletedAt`. |

Сервер назначает `ownerId` по текущему пользователю. `DELETE` заполняет `deletedAt`. Удалённая доска исключается из списка и недоступна по ID. Совместный доступ и восстановление описываются отдельно.

## REST API

Базовый путь — `/api/v1`. Маршруты `/users/me` и `/boards` требуют аутентификации. После регистрации клиент вызывает вход отдельным запросом.

| Метод и путь | Тело JSON | Успех | Ошибки |
| --- | --- | --- | --- |
| `POST /auth/register` | `{email, password, name?}` | `201 UserProfile` | `400`, `409` email занят |
| `POST /auth/login` | `{email, password}` | `200 UserProfile` | `400`, `401` неверные данные входа |
| `POST /auth/logout` | — | `204` | — |
| `GET /users/me` | — | `200 UserProfile` | `401` |
| `PATCH /users/me` | `{name?, avatarUrl?}` | `200 UserProfile` | `400`, `401` |
| `GET /boards` | — | `200 BoardCard[]`, пустой список — `[]` | `401` |
| `POST /boards` | `{title}` | `201 BoardCard` | `400`, `401` |
| `GET /boards/:id` | — | `200 BoardCard` | `400`, `401`, `404` |
| `PATCH /boards/:id` | `{title}` | `200 BoardCard` | `400`, `401`, `404` |
| `DELETE /boards/:id` | — | `204` | `400`, `401`, `404` |

- `UserProfile` содержит `id`, `email`, `name`, `avatarUrl`, `createdAt`, `updatedAt`. Поля строковые, `name` и `avatarUrl` допускают `null`. PATCH требует хотя бы одно поле. Пропущенное поле сохраняет значение, `null` очищает его.
- `BoardCard` содержит строковые `id`, `title`, `updatedAt`. Название после trim содержит 1–120 символов. Сортировка списка — `updatedAt DESC, id ASC`. Даты в ответах — ISO 8601 UTC.
- При регистрации и входе сервер применяет trim и нижний регистр к email. Пароль передаётся строкой с исходными пробелами.
- `400` — невалидные поля или UUID. `404` — доска отсутствует, удалена или принадлежит другому пользователю. `204` возвращается без тела. Для ошибок приложения используется `{statusCode, error, message}`.

## Размещение в проекте

Модели Prisma — `apps/api/prisma/schema/models`, контроллеры, DTO и сервисы — в модулях `auth`, `users` и `boards` внутри `apps/api/src/modules`. Запросы к Prisma выполняют репозитории. Общие HTTP-схемы — `packages/contracts` по [ADR 0002](./0002-shared-contracts.md).

## Открытый вопрос

Согласовать формат аутентификации: что выдаёт вход, как клиент подтверждает вход в защищённых запросах и как выход отзывает доступ.

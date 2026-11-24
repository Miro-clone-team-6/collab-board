# 0020. Модели MVP и REST API с JWT-аутентификацией

> Статус: 💬 Предложено.
> Реализация: частично — исходная модель User и заглушка списка досок. Описанные API и авторизация не реализованы.
> Дата: 18 ноября 2026.
> Issue: [#20](https://github.com/Miro-clone-team-6/collab-board/issues/20).

## Контекст

Задача требует модели, REST-контракт и устройство JWT с access/refresh-токенами.
[Ревью PR #25](https://github.com/Miro-clone-team-6/collab-board/pull/25) предлагает обязательное имя, участников доски и таблицы типов.
В [User](../../apps/api/prisma/schema/models/user.prisma) имя пока nullable, пароля нет.
[Карточка фронтенда](../../apps/web/src/entities/board/model/types.ts) содержит id, title, updatedAt.
[Продукт](../product.md) требует корзину и совместную работу, а роли задаёт на уровне workspace.

## Решение

Предлагаем User, Board, BoardMember и RefreshSession.
Доступ задаём на уровне доски. Отклонение от workspace в продукте требует согласования.
Объём ADR — профиль, метаданные доски и вход. Приглашения, workspace, восстановление и холст — отдельные задачи.

### Поля хранения

В таблице указаны типы Prisma и Prisma Client. Фронт использует JSON-контракт.
ID — UUID-строка в TEXT, как в текущей модели (`String @default(uuid())`).
Даты — TIMESTAMP(3), значения записываем в UTC. Поля без `?` обязательны.

| Модель / поле | Тип БД | Prisma / Client | Назначение |
| --- | --- | --- | --- |
| User.id | TEXT PK | String / string | UUID пользователя |
| User.email | TEXT UNIQUE | String / string | Адрес входа |
| User.name | TEXT NOT NULL | String / string | Отображаемое имя |
| User.avatarUrl | TEXT NULL | String? / string или null | Ссылка на аватар |
| User.passwordHash | TEXT NOT NULL | String / string | Хеш пароля |
| User.createdAt | TIMESTAMP(3) | DateTime / Date | Дата регистрации |
| User.updatedAt | TIMESTAMP(3) | DateTime / Date | Дата изменения профиля |
| Board.id | TEXT PK | String / string | UUID доски |
| Board.title | TEXT | String / string | Название |
| Board.ownerId | TEXT FK User.id | String / string | Владелец |
| Board.updatedAt | TIMESTAMP(3) | DateTime / Date | Изменение метаданных |
| Board.deletedAt | TIMESTAMP(3) NULL | DateTime? / Date или null | Мягкое удаление |
| BoardMember.boardId | TEXT FK Board.id | String / string | Доска |
| BoardMember.userId | TEXT FK User.id | String / string | Участник |
| BoardMember.role | ENUM BoardRole | BoardRole / enum | editor или viewer |
| RefreshSession.id | TEXT PK | String / string | UUID сессии, claim sid |
| RefreshSession.userId | TEXT FK User.id | String / string | Пользователь сессии |
| RefreshSession.tokenHash | TEXT UNIQUE | String / string | SHA-256 текущего refresh JWT |
| RefreshSession.expiresAt | TIMESTAMP(3) | DateTime / Date | Абсолютное окончание сессии |
| RefreshSession.revokedAt | TIMESTAMP(3) NULL | DateTime? / Date или null | Отзыв сессии |

BoardMember имеет составной PK `(boardId, userId)` — повторное участие невозможно. Индекс по userId нужен для списка доступных досок.
Индексы Board.ownerId и RefreshSession.userId ускоряют выборки пользователя.
Обратные связи Prisma: User.boards, User.memberships, User.sessions, Board.members.
Владелец хранится только в Board.ownerId. Сервис запрещает дублировать его в BoardMember.
FK владельца использует RESTRICT при физическом удалении User. Физическое удаление аккаунта и передача владения вне этого контракта.
Удаление участника из BoardMember отзывает доступ. Для зависимых BoardMember и RefreshSession при физическом удалении родителя используем CASCADE.

### Права на доску

| Действие | Владелец | editor | viewer |
| --- | --- | --- | --- |
| Список и просмотр | Да | Да | Да |
| Переименование | Да | Да | Нет |
| Удаление | Да | Нет | Нет |

Список включает собственные доски и доски с записью BoardMember, без дублей и удалённых.
POST берёт ownerId из текущего пользователя.
DELETE заполняет deletedAt и закрывает доступ всем. Данные сохраняются для корзины.
Проверку доступа и изменение выполняем согласованно в транзакции, чтобы отзыв прав или удаление не пропустили конкурирующую запись.
Удалить доску может только владелец. Право редактора на переименование требует согласования.

### Контракт HTTP

База — `/api/v1`. Все маршруты users и boards требуют `Authorization: Bearer <accessToken>`.

| Метод и путь | JSON запроса | Успех | Ошибки |
| --- | --- | --- | --- |
| POST /auth/register | `{email, password, name}` | 201 UserProfile | 400, 409 |
| POST /auth/login | `{email, password}` | 200 AuthResult и refresh-cookie | 400, 401 |
| POST /auth/refresh | Без тела, refresh-cookie | 200 AuthResult и новая refresh-cookie | 401, 403 |
| POST /auth/logout | Без тела, refresh-cookie | 204, очистить cookie и отозвать сессию | 403 |
| GET /users/me | — | 200 UserProfile | 401 |
| PATCH /users/me | `{name?, avatarUrl?}` | 200 UserProfile | 400, 401 |
| GET /boards | — | 200 BoardCard[] | 401 |
| POST /boards | `{title}` | 201 BoardCard | 400, 401 |
| GET /boards/:id | — | 200 BoardCard | 400, 401, 404 |
| PATCH /boards/:id | `{title}` | 200 BoardCard | 400, 401, 403, 404 |
| DELETE /boards/:id | — | 204 | 400, 401, 403, 404 |

**Ответы** — только перечисленные поля. Даты — строки ISO 8601 UTC.

```ts
type UserProfile = { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string; updatedAt: string };
type BoardCard = { id: string; title: string; updatedAt: string; role: "owner" | "editor" | "viewer" };
type AuthResult = { accessToken: string; tokenType: "Bearer"; expiresIn: 86400; user: UserProfile };
type ApiError = { statusCode: number; error: string; message: string };
```

- После регистрации — отдельный login. Email валидируем и нормализуем (`trim`, lowercase), дубликат → `409`.
- После `trim`: `name` 1–80, `title` 1–120 символов. Пароль 8–128 без `trim`. `avatarUrl` — абсолютный HTTP(S) URL или `null`.
- PATCH профиля требует ≥1 поля. Пропуск сохраняет значение, `null` очищает аватар. Неизвестные поля, невалидное тело или UUID → `400`.
- Список без пагинации: `updatedAt DESC, id ASC`, пустой результат — `[]`.
- Недоступная, удалённая или отсутствующая доска → `404`. Запрещённое действие на видимой доске или отклонённый `Origin` → `403`.

### Вход и проверка доступа

- **Вход.** Проверяем пароль по хешу Argon2id с солью. Access живёт 24 часа в памяти фронта. Refresh и `RefreshSession` действуют 7 дней от входа.
- **JWT.** Оба токена содержат `sub=userId`, `sid=sessionId`, `iat`. Refresh также содержит случайный `jti`. Проверяем подпись HS256, `exp`, `iss`, `aud` и `tokenUse` (`access`/`refresh`). Секреты для двух типов токенов раздельные, из окружения.
- **Браузер.** Cookie `refreshToken` действует до конца сессии (`HttpOnly`, `SameSite=Lax`, `Path=/api/v1/auth`, без `Domain`, в production — `Secure`). Фронт и API на одном site. Login, refresh и logout используют `credentials: include`. Все POST `/auth/*` проверяют `Origin` по списку разрешённых.
- **Доступ.** Кроме явно публичных маршрутов, `JwtAuthGuard` проверяет access и активную сессию по `sid` и `sub` на каждый запрос. Обработчик получает `userId`, сервис `boards` проверяет `ownerId` и `BoardMember`.
- **Обновление.** После `401` защищённого запроса вкладки выполняют один общий refresh. Сервер проверяет JWT и активную сессию, атомарно сверяет и заменяет хеш, выдаёт новую пару токенов. Повтор подписанного старого refresh отзывает сессию. При успехе фронт повторяет запрос, при отказе открывает вход.
- **Выход.** Отзыв сессии действует сразу. Cookie очищаем с исходными атрибутами. При отсутствующей или недействующей cookie также возвращаем `204`.

### Встраивание в проект

- **Контракты.** Zod-схемы и типы — в `packages/contracts`. Из схем строим DTO и по ним проверяем запросы. Ошибки валидации и guard возвращаем в формате `ApiError`. См. [общие контракты](0003-shared-contracts.md).
- **Модули.** В `auth`, `users` и `boards` следуем [структуре backend](../backend/backend-structure.md). `JwtAuthGuard` размещаем в `auth`, Prisma-запросы — в репозиториях API.
- **Миграция.** Добавляем модели и индексы. Поля `User.name` и `User.passwordHash` сразу обязательны. Обновляем seed тестового пользователя под новую схему.

## От чего отказались

- Только ownerId — не описывает участников чужих досок из ревью.
- Роль owner одновременно в BoardMember и Board — два источника истины могут разойтись.
- Долгий access без refresh и хранения сессий — не выполняет новое ТЗ и мешает отзывать вход.
- Refresh в localStorage и открытом виде в БД — выше риск кражи токена.
- Физическое удаление доски — мешает корзине из требований продукта.

## Последствия

До реализации согласовать роли, cookie и сроки токенов.
Появляются миграция схемы, хранение сессий, ротация refresh и координация обновления на фронте.
При реализации проверить регистрации-дубликаты, null-поля PATCH, чужие и удалённые доски, все роли, отзыв сессии, истечение и повтор refresh, конкурентную ротацию и Origin-проверку.
До реализации приглашений совместный доступ проверяется через тестовые BoardMember.

# Ветки, коммиты, Pull Request

> **Статус:** 🚧 Черновик · 2026-11-11. CI ещё нет.

## Задачи

Задачи ведутся в GitHub Issues. Каждый PR связан с issue.

## Ветки

Правила написания веток

## Коммиты

Conventional Commits, проверяется commitlint на `commit-msg`:

```text
<тип>(<scope>): <сообщение без точки в конце>
```

- `scope` **обязателен**.
- Сообщение **только на английском**, в повелительном наклонении (`add`, `fix`, не `added`).
- Типы: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `style`, `chore`, `ci`.
- Scope — имя workspace (`web`, `api`, `ui`, `dto`, `utils`, `types`, `tailwind-config`) или
  `repo` (конфиги монорепо), `docs`, `ci`, `infra` (Docker).

```text
feat(web): add sign-in form
fix(api): return 404 for missing board
docs(repo): describe auth decision
```

## Перед PR

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Если менялась `schema.prisma` — миграция в том же PR.

## PR

- **Заголовок** — в формате коммита: `feat(web): add sign-in form`.
- **Описание: ?**

## Ревью и мерж

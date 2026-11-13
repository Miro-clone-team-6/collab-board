# HTTP-контракты

> Статус: ✅ Общий пакет схем и типов; используется для healthcheck.

Устройство и подключение к Nest — в [backend](../../docs/backend/README.md#http-контракты).
Обоснование — [ADR 0003-shared-contracts](../../docs/decisions/0003-shared-contracts.md).

Команды из корня репозитория:

```bash
pnpm build:contracts
pnpm --filter @packages/contracts dev
```

Первая команда собирает пакет, вторая запускает его сборку в watch-режиме.

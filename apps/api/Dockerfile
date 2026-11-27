# base — общий образ с Node.js 26
FROM node:26-bookworm-slim AS base
WORKDIR /app

# prepare — оставляем API и нужные ему пакеты монорепозитория
FROM base AS prepare
RUN npm install --global turbo@2.11.10
COPY . .
RUN turbo prune api --docker --out-dir=/pruned

# runtime — системные библиотеки для Prisma и TLS
FROM base AS runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

# manifests — сокращённый lockfile и pnpm для обеих установок
FROM runtime AS manifests
ENV HUSKY=0
COPY --from=prepare /pruned/json/ ./
RUN npm install --global "$(node -p 'require("./package.json").packageManager')" \
    && chown -R node:node /app

# dependencies — зависимости для сборки и миграций
FROM manifests AS dependencies
# Копируем схему и конфигурацию до установки: postinstall создаёт Prisma Client.
COPY --from=prepare --chown=node:node /pruned/full/apps/api/prisma.config.ts apps/api/
COPY --from=prepare --chown=node:node /pruned/full/apps/api/src/config/database-url.ts /pruned/full/apps/api/src/config/env-file.ts apps/api/src/config/
COPY --from=prepare --chown=node:node /pruned/full/apps/api/prisma/schema/ apps/api/prisma/schema/
USER node
RUN pnpm install --frozen-lockfile --store-dir=/tmp/pnpm-store && rm -rf /tmp/pnpm-store

# build — компилируем API, включая Prisma Client, и общие контракты
FROM dependencies AS build
COPY --from=prepare --chown=node:node /pruned/full/ ./
RUN pnpm build:api

# migrator — запускаем SQL-миграции через Prisma CLI
FROM dependencies AS migrator
ENV NODE_ENV=production
COPY --from=prepare --chown=node:node /pruned/full/apps/api/prisma/migrations/ apps/api/prisma/migrations/
CMD ["pnpm", "db:migrate:deploy"]

# production-dependencies — устанавливаем только зависимости для запуска API
FROM manifests AS production-dependencies
USER node
# Пропускаем postinstall: готовый Prisma Client берём из стадии build.
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter 'api...' \
    --store-dir=/tmp/pnpm-store && rm -rf /tmp/pnpm-store

# api — запускаем собранный Nest-сервер от пользователя node
FROM runtime AS api
ENV NODE_ENV=production
# Сохраняем расположение каталогов, чтобы относительные ссылки pnpm работали.
COPY --from=production-dependencies /app/node_modules/ ./node_modules/
COPY --from=production-dependencies /app/apps/api/node_modules/ ./apps/api/node_modules/
COPY --from=production-dependencies /app/packages/contracts/node_modules/ ./packages/contracts/node_modules/
COPY --from=build /app/packages/contracts/package.json ./packages/contracts/
COPY --from=build /app/packages/contracts/dist/ ./packages/contracts/dist/
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/dist/ ./apps/api/dist/
WORKDIR /app/apps/api
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]

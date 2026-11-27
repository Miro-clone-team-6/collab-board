# base — общий образ с Node.js 26
FROM node:26-bookworm-slim AS base
WORKDIR /app

# prepare — оставляем web и нужные ему пакеты монорепозитория
FROM base AS prepare
RUN npm install --global turbo@2.11.10
COPY . .
RUN turbo prune web --docker --out-dir=/pruned

# dependencies — устанавливаем зависимости до копирования исходников
FROM base AS dependencies
ENV HUSKY=0
COPY --from=prepare /pruned/json/ ./
# Берём версию pnpm из packageManager и даём пользователю node права записи в /app.
RUN npm install --global "$(node -p 'require("./package.json").packageManager')" \
    && chown -R node:node /app

USER node
RUN pnpm install --frozen-lockfile

# build — собираем standalone-версию Next.js
FROM dependencies AS build
COPY --from=prepare --chown=node:node /pruned/full/ ./
ARG API_INTERNAL_URL=http://api:3001
ENV API_INTERNAL_URL=${API_INTERNAL_URL}
# Next.js оставляет статику и public вне standalone. Добавляем их к серверу.
RUN pnpm build:web \
    && cp -R apps/web/.next/static apps/web/.next/standalone/apps/web/.next/ \
    && if [ -d apps/web/public ]; then \
         cp -R apps/web/public apps/web/.next/standalone/apps/web/; \
       fi

# web — запускаем готовый сервер от пользователя node
FROM base AS web
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/apps/web/.next/standalone/ ./
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

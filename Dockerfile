# 1. Устанавливаем зависимости
FROM node:20.11-alpine AS dependencies
WORKDIR /app

# Включаем corepack для использования pnpm без отдельной установки
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Копируем файлы конфигурации. 
# ВАЖНО: pnpm-workspace.yaml нужен, если проект использует воркспейсы
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

# Устанавливаем зависимости. --frozen-lockfile — аналог npm ci
RUN pnpm install --frozen-lockfile

# 2. Билдим приложение
FROM node:20.11-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Копируем все исходники
COPY . .
# Копируем установленные зависимости из предыдущего слоя
COPY --from=dependencies /app/node_modules ./node_modules

# Запускаем билд
RUN pnpm run build:production

# 3. Стейдж запуска (Runner)
FROM node:20.11-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем только те файлы, которые реально нужны для работы
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/pnpm-workspace.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Переключаемся на непривилегированного пользователя
USER node

EXPOSE 3000
CMD ["pnpm", "start"]

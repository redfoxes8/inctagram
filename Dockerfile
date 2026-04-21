# Устанавливаем зависимости
FROM node:20.11-alpine AS dependencies
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Билдим приложение
FROM node:20.11-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build:production

# Стейдж запуска
FROM node:20.11-alpine AS runner
WORKDIR /app

#  Устанавливаем pnpm ДО переключения пользователя
RUN corepack enable && corepack prepare pnpm@latest --activate

# Копируем необходимые файлы
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

#  переключаемся на непривилегированного пользователя
USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["pnpm", "start"]
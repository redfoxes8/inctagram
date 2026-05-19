# Устанавливаем зависимости
FROM node:22-alpine AS dependencies
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Билдим приложение
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY . .

# Копируем node_modules из dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Проверяем наличие package.json и скрипта
RUN echo "=== Checking package.json ===" && \
    ls -la package.json && \
    cat package.json | grep "build:production"

# Запускаем сборку
RUN pnpm run build:production

# Стейдж запуска
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["pnpm", "start"]
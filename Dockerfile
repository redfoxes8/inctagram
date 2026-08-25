# # Устанавливаем зависимости
# FROM node:22-alpine AS dependencies
# WORKDIR /app

# RUN npm install -g pnpm@9.15.0

# COPY package.json pnpm-lock.yaml* ./
# RUN pnpm install --frozen-lockfile

# # Билдим приложение
# FROM node:22-alpine AS builder
# WORKDIR /app

# RUN npm install -g pnpm@9.15.0

# COPY . .

# # Копируем node_modules из dependencies
# COPY --from=dependencies /app/node_modules ./node_modules

# # Проверяем наличие package.json и скрипта
# RUN echo "=== Checking package.json ===" && \
#     ls -la package.json && \
#     cat package.json | grep "build:production"

# # Удаляем файл воркспейса, который ломает pnpm, и запускаем сборку
# RUN rm -f pnpm-workspace.yaml && pnpm run build:production

# # Стейдж запуска
# FROM node:22-alpine AS runner
# WORKDIR /app

# RUN npm install -g pnpm@9.15.0

# COPY --from=builder /app/package.json ./
# COPY --from=builder /app/pnpm-lock.yaml* ./
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.env ./

# USER node

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1

# EXPOSE 3000
# CMD ["pnpm", "start"]
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

# 👇 Передаём переменные на этапе сборки
ARG API_BASE_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NODE_TLS_REJECT_UNAUTHORIZED

# 👇 Устанавливаем их как ENV на время сборки
ENV API_BASE_URL=$API_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NODE_TLS_REJECT_UNAUTHORIZED=$NODE_TLS_REJECT_UNAUTHORIZED

COPY . .

# Копируем node_modules из dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Проверяем переменные (для отладки)
RUN echo "API_BASE_URL: ${API_BASE_URL}" && \
    echo "NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}"

# Удаляем файл воркспейса, который ломает pnpm, и запускаем сборку
RUN rm -f pnpm-workspace.yaml && pnpm run build:production

# Стейдж запуска
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9.15.0

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 👇 Копируем .env для рантайма
COPY --from=builder /app/.env ./

USER node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
CMD ["pnpm", "start"]
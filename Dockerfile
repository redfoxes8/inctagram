# Устанавливаем зависимости
FROM node:20.11-alpine as dependencies
WORKDIR /app

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Билдим приложение
FROM node:20.11-alpine as builder
WORKDIR /app

# Устанавливаем pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm run build:production

# Стейдж запуска
FROM node:20.11-alpine as runner
USER node
WORKDIR /app
ENV NODE_ENV production

# Устанавливаем pnpm для запуска
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=builder --chown=node:node /app/ ./

EXPOSE 3000
CMD ["pnpm", "start"]
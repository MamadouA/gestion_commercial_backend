FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN corepack enable

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate 
RUN pnpm build 

FROM node:24-alpine AS runner

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN addgroup -S nestjs && adduser -S nestjs -G nestjs


COPY --from=builder --chown=nestjs:nestjs /app/dist/ ./dist/
COPY --from=builder --chown=nestjs:nestjs /app/prisma ./prisma

RUN corepack enable

RUN pnpm install --prod --frozen-lockfile

USER nestjs

EXPOSE 3000


CMD ["pnpm", "start:prod"]
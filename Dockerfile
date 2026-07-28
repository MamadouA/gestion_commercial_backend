FROM node:24-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile


FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm prisma generate
RUN pnpm build


FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

RUN pnpm prune --prod

COPY --from=builder /app/dist/src ./dist

USER node

EXPOSE 3000

CMD ["pnpm", "pnpm prisma migrate deploy && pnpm start:prod"]
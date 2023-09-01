FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@8.7.6 --activate

RUN pnpm install


FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8.7.6 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build


FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME 0.0.0.0

CMD ["/app/server.js"]

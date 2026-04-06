FROM node:20-alpine AS base
RUN npm install -g pnpm@9.15.0

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=deps /app/ ./
COPY . .
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/server build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=build /app/packages/shared ./packages/shared
EXPOSE 3001
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]

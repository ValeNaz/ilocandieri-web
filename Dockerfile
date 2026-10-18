# I Locandieri - production image (multi-stage, non-root).
# NOTE: next.config.ts has no `output: "standalone"`, so the runtime image keeps node_modules
# (needed anyway for `tsx scripts/migrate.ts` at startup). Works with or without standalone.

ARG NODE_VERSION=24
FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
ARG PNPM_VERSION=9.12.0
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /app

# ---- deps: install with the lockfile only (cache friendly)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- build
FROM deps AS build
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# ---- runtime
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/app.db \
    STORAGE_DRIVER=local \
    STORAGE_DIR=/app/storage
# sqlite3 CLI: handy for manual inspection and consistent backups from inside the container.
RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json /app/pnpm-lock.yaml /app/next.config.ts /app/tsconfig.json /app/drizzle.config.ts ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/src ./src
COPY --from=build --chown=node:node /app/drizzle ./drizzle
COPY --from=build --chown=node:node /app/scripts ./scripts
COPY --chown=node:node docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/data /app/storage /app/backups \
    && chown -R node:node /app/data /app/storage /app/backups
VOLUME ["/app/data", "/app/storage"]
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["start"]

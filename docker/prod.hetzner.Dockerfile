FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# This stage only compiles TypeScript; it never launches a browser, so skip
# puppeteer's Chromium download (the build-stage base image lacks unzip).
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src src
RUN npm run build

FROM 88a3be32-7c1b-485a-9715-09f7f654160a.europe.registry.cloudfleet.dev/hub-bill-base:latest
WORKDIR /app

RUN groupadd -r hub-bill && useradd -r -g hub-bill -m hub-bill

COPY package.json package-lock.json ./
# Fixed cache dir under /app so it's covered by the chown below - npm ci runs
# as root here, but the app runs as the unprivileged hub-bill user, and the
# default cache path is derived from $HOME (root's, not hub-bill's).
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

RUN chown -R hub-bill:hub-bill /app
USER hub-bill

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["node", "dist/main"]
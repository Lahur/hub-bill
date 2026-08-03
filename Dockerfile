FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src src
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app

# Shared libs required by puppeteer's bundled Chromium (used by ReportsService for PDF generation).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
       libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
       libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 \
       libxrandr2 xdg-utils libu2f-udev libvulkan1 wget \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r hub-bill && useradd -r -g hub-bill -m hub-bill

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

RUN chown -R hub-bill:hub-bill /app
USER hub-bill

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/main"]
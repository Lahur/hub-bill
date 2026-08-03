FROM node:20-bookworm-slim

# Shared libs required by puppeteer's bundled Chromium (used by ReportsService for PDF generation).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
       libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 \
       libx11-xcb1 libxcomposite1 libxdamage1 libxfixes3 libxkbcommon0 \
       libxrandr2 xdg-utils libu2f-udev libvulkan1 wget unzip \
    && rm -rf /var/lib/apt/lists/*
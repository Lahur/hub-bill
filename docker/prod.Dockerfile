FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src src
RUN npm run build

FROM docker-registry.registry.svc.cluster.local:5000/hub-bill-base:latest
WORKDIR /app

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
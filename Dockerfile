# خادم تطبيق أولياء الأمور (للمورّد) — يبني التطبيق ويشغّل الخادم بلا حزم تشغيل خارجية
FROM node:20-alpine AS build
WORKDIR /app
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build:parent

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8787 DATA_DIR=/data
COPY --from=build /app/server ./server
COPY --from=build /app/dist-parent ./dist-parent
COPY --from=build /app/src/services/licensing/licensePublicKey.ts ./src/services/licensing/licensePublicKey.ts
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8787
HEALTHCHECK CMD wget -qO- http://127.0.0.1:${PORT}/v1/health || exit 1
CMD ["node", "server/parent-relay.mjs"]

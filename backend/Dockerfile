# ========== Stage 1: Сборка фронтенда (статики) ==========
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package.json ./
RUN npm i

COPY frontend/ .
RUN npm run build

# ========== Stage 2: Бэкенд + раздача статики ==========
FROM node:20-alpine

# Системные зависимости для sqlite3
# RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY backend/package.json ./
RUN npm i

COPY backend/ .

# Копируем собранную статику фронтенда
COPY --from=frontend-builder /frontend/dist /app/public

# Переменные окружения по умолчанию
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_STORAGE=/app/database.sqlite
ENV FRONTEND_URL=http://localhost:25426

EXPOSE 3000

# entrypoint: сначала seed, потом сервер
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
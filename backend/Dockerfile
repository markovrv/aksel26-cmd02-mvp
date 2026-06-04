# ========== Stage 1: Сборка фронтенда ==========
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Копируем package.json и lock-файлы фронтенда (из корня проекта через docker-compose context)
COPY frontend/package*.json ./
RUN npm install

# Копируем исходники фронтенда
COPY frontend/ .

# Собираем фронтенд в статику
RUN npm run build

# ========== Stage 2: Бэкенд + статика ==========
FROM node:20-alpine

# Устанавливаем системные зависимости (для sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Копируем package.json и устанавливаем зависимости бэкенда
COPY backend/package*.json ./
RUN npm install --omit=dev

# Копируем исходники бэкенда
COPY backend/ .

# Создаём папку для данных
RUN mkdir -p /app/data

# Копируем existing базу данных в volume
COPY backend/database.sqlite /app/data/database.sqlite
RUN chmod 666 /app/data/database.sqlite

# Копируем собранный фронтенд из stage 1 в public-директорию бэкенда
COPY --from=frontend-builder /frontend/dist /app/public

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_STORAGE=/app/data/database.sqlite
ENV FRONTEND_URL=http://localhost:25426

EXPOSE 3000

CMD ["node", "server.js"]
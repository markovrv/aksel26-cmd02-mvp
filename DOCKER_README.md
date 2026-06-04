# Docker Setup

Проект запускается в одном контейнере: фронтенд собирается в статику и раздаётся бэкендом, API доступен по тому же порту.

## Быстрый старт

```bash
docker compose up -d
```

Приложение будет доступно по адресу: http://localhost:25426

## Остановка

```bash
docker compose down
```

## Логи

```bash
docker compose logs -f
```

## Пересборка

```bash
docker compose build --no-cache
docker compose up -d
```

## Переменные окружения

Все настройки задаются в `docker-compose.yml` в секции `environment` или в файле `backend/.env.docker`:

| Переменная     | Описание                          | Значение по умолчанию          |
|----------------|-----------------------------------|--------------------------------|
| PORT           | Внутренний порт контейнера        | 3000                           |
| JWT_SECRET     | Секретный ключ для JWT            | (изменить в production!)       |
| JWT_EXPIRES_IN | Время жизни токена                | 24h                            |
| FRONTEND_URL   | URL фронтенда (для CORS)          | http://localhost:25426         |
| DB_STORAGE     | Путь к файлу SQLite               | /app/database.sqlite           |

## Полезные команды

```bash
# Проверка статуса
docker compose ps

# Войти в контейнер
docker compose exec app sh
```

## Тестовые аккаунты (после seed)

- seeker1@test.local / password123 (Соискатель)
- student1@test.local / password123 (Студент)
- hr1@zavod.local / password123 (HR)
- admin@test.local / password123 (Админ)
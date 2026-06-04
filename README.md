# Akcelerator-02 — Платформа профориентации и трудоустройства на промышленные предприятия

## Обзор проекта

**Akcelerator-02** — веб-приложение для профориентации, оценки компетенций и трудоустройства соискателей (включая студентов) на промышленные предприятия. Платформа выступает связующим звеном между кандидатами и работодателями: пользователи проходят диагностику, получают персонализированные рекомендации по вакансиям и экскурсиям, подают отклики, бронируют туры на предприятия и общаются с представителями компаний через встроенный мессенджер.

Проект построен на архитектуре **клиент-сервер**:
- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Zustand
- **Backend**: Node.js (Express 5) + Sequelize ORM (SQLite/PostgreSQL) + JWT

---

## Содержание

1. [Функционал](#функционал)
2. [Роли пользователей и сценарии](#роли-пользователей-и-сценарии)
3. [Структура проекта](#структура-проекта)
4. [Схемы данных (модели)](#схемы-данных-модели)
5. [API-маршруты](#api-маршруты)
6. [Ключевые бизнес-процессы](#ключевые-бизнес-процессы)
7. [Стейт-менеджмент (Frontend)](#стейт-менеджмент-frontend)
8. [Работа с внешним API](#работа-с-внешним-api)
9. [Запуск и настройка](#запуск-и-настройка)
10. [Планируемые доработки](#планируемые-доработки)

---

## Функционал

### Для соискателей / студентов

- **Регистрация и аутентификация** (JWT, refresh-токены, подтверждение email)
- **Заполнение расширенного профиля** (город, желаемая должность, зарплата, готовность к переезду, сведения об образовании, ограничения по здоровью и др.)
- **Профориентационное тестирование** (набор вопросов с весовыми коэффициентами)
- **Генерация персонализированных рекомендаций** вакансий и предприятий на основе ответов ассессмента (встроенный алгоритм или внешняя LLM-система)
- **Каталог предприятий** с детальным описанием (условия труда, безопасность, медосмотры, ссылка на коллективный договор)
- **Каталог вакансий** с фильтрацией по типу занятости, зарплате, графику
- **Каталог экскурсий на предприятия** (офлайн и онлайн)
- **Подача откликов на вакансии** (сопроводительное письмо)
- **Бронирование экскурсий** на предприятия
- **Личный кабинет** (дашборд) с просмотром откликов, бронирований, рекомендаций
- **Цифровой паспорт** и **сообщения** (планируется)

### Для предприятий (enterprise_user)

- **Дашборд** со сводной статистикой
- **Управление вакансиями** (CRUD: создание, редактирование, публикация, архивация)
- **Управление откликами** на вакансии (просмотр, смена статуса: просмотрено, приглашён, отклонён, нанят)
- **Управление экскурсиями** (CRUD: создание, указание формата, даты, вместимости)
- **Управление бронированиями** экскурсий (подтверждение, отмена, отметка о посещении)
- **Редактирование профиля предприятия** (описание, условия труда, модерация)

### Общие

- Система ролей и прав доступа (RBAC)
- JWT-аутентификация с access/refresh токенами
- Обработка ошибок с единым middleware
- Helmet + CORS для безопасности
- Валидация данных через Joi
- Docker-контейнеризация (nginx + Node.js)
- Наполнение тестовыми данными через seed-скрипт

---

## Роли пользователей и сценарии

| Роль | Описание | Основные сценарии |
|------|----------|-------------------|
| `seeker` | Соискатель рабочей специальности | Прохождение ассессмента, просмотр рекомендаций, отклик на вакансии, бронь экскурсий |
| `student` | Студент, ищущий практику или стажировку | Аналогично seeker, но с контекстом student и доступом к практикам |
| `enterprise_user` | Сотрудник предприятия (HR) | Управление вакансиями, экскурсиями, откликами, профилем предприятия |
| `superadmin` | Администратор платформы | Управление пользователями, модерация предприятий |

---

## Структура проекта

```
02/
├── backend/                          # Node.js / Express 5 сервер
│   ├── src/
│   │   ├── app.js                    # Точка входа: настройка middleware, роутов
│   │   ├── config/
│   │   │   ├── database.js           # Подключение Sequelize (SQLite/PostgreSQL)
│   │   │   └── env.js               # Чтение env-переменных
│   │   ├── models/
│   │   │   ├── index.js             # Модели + ассоциации
│   │   │   ├── User.js              # Пользователь
│   │   │   ├── UserProfile.js       # Профиль пользователя
│   │   │   ├── Enterprise.js        # Предприятие
│   │   │   ├── Vacancy.js           # Вакансия
│   │   │   ├── AssessmentSession.js # Сессия ассессмента
│   │   │   ├── AssessmentAnswer.js  # Ответ на вопрос ассессмента
│   │   │   ├── MatchResult.js       # Результат матчинга
│   │   │   ├── Tour.js              # Экскурсия
│   │   │   ├── TourBooking.js       # Бронирование экскурсии
│   │   │   ├── Application.js       # Отклик на вакансию
│   │   │   ├── Message.js           # Сообщение
│   │   │   └── MessageThread.js     # Тред сообщений
│   │   ├── controllers/             # Контроллеры (обработчики запросов)
│   │   ├── services/                # Сервисы (бизнес-логика)
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT-аутентификация, проверка ролей
│   │   │   └── errorHandler.js      # Глобальный обработчик ошибок
│   │   ├── routes/                  # Express-роутеры
│   │   └── db/
│   │       └── seeds.js             # Сид-скрипт (тестовые данные)
│   ├── server.js                    # Запуск сервера + синхронизация БД
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                         # React 19 / Vite 8 клиент
│   ├── src/
│   │   ├── main.jsx                 # Точка входа React
│   │   ├── App.jsx                  # Роутер (React Router DOM v7)
│   │   ├── components/              # UI-компоненты
│   │   │   ├── Header.jsx           # Шапка
│   │   │   ├── Footer.jsx           # Подвал
│   │   │   ├── LoginForm.jsx        # Форма входа
│   │   │   ├── RegisterForm.jsx     # Форма регистрации (3 шага)
│   │   │   └── ProtectedRoute.jsx   # Компонент защиты маршрутов по роли
│   │   ├── pages/                   # Страницы приложения
│   │   ├── services/
│   │   │   └── api.js               # Axios-клиент
│   │   ├── store/                   # Zustand-сторы
│   │   │   ├── authStore.js         # Состояние аутентификации
│   │   │   └── assessmentStore.js   # Состояние ассессмента
│   │   └── styles/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── nginx.conf                   # Nginx-конфиг для Docker
│
├── docs/                             # Документация
│   ├── ARCHITECTURE.md               # Архитектура проекта
│   ├── API.md                        # Документация API
│   └── API-new.md                    # Новая версия API-документации
│
├── docker-compose.yml                # Docker Compose (backend + frontend)
├── DOCKER_README.md                  # Инструкция по запуску через Docker
└── README.md                         # Настоящий файл
```

---

## Схемы данных (модели)

Ниже приведено описание моделей Sequelize. Все модели используют UUID в качестве первичного ключа и автоматические поля `createdAt` / `updatedAt`.

### User (`users`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| email | STRING(255), unique, lowercase | Email пользователя |
| passwordHash | STRING(255) | Хеш пароля (bcrypt, salt=10) |
| role | ENUM('seeker','student','enterprise_user','superadmin') | Роль в системе |
| enterpriseId | UUID FK → enterprises.id | Привязка к предприятию (если enterprise_user) |
| status | ENUM('active','pending','blocked') | Статус аккаунта |
| emailVerified | BOOLEAN | Подтверждён ли email |

### UserProfile (`user_profiles`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| userId | UUID FK → users.id | Привязка к пользователю |
| fullName | STRING(255) | ФИО |
| phone | STRING(32) | Телефон |
| city | STRING(128) | Город проживания |
| age | INTEGER | Возраст |
| relocationReady | BOOLEAN | Готовность к переезду |
| desiredPosition | STRING(255) | Желаемая должность |
| desiredSalaryFrom | INTEGER | Нижняя граница зарплаты |
| desiredSalaryTo | INTEGER | Верхняя граница зарплаты |
| preferredSchedule | STRING(128) | Предпочитаемый график |
| healthLimitations | TEXT | Ограничения по здоровью |
| experienceSummary | TEXT | Опыт работы |
| educationInfo | TEXT | Образование |
| studentInfoJson | JSONB | Данные студента (вуз, курс, специальность, формат практики) |

### Enterprise (`enterprises`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| name | STRING(255) | Название предприятия |
| slug | STRING(255), unique | Slug для URL |
| industry | STRING(128) | Отрасль |
| region | STRING(128) | Регион (федеральный округ) |
| city | STRING(128) | Город |
| address | STRING(255) | Адрес |
| description | TEXT | Описание деятельности |
| laborConditions | TEXT | Условия труда |
| safetyInfo | TEXT | Информация о безопасности |
| salaryCalcInfo | TEXT | Информация о расчёте зарплаты |
| medicalExamInfo | TEXT | Информация о медосмотрах |
| collectiveAgreementUrl | STRING(500) | Ссылка на коллективный договор |
| logo | STRING(500) | URL логотипа |
| moderationStatus | ENUM('draft','pending','approved','rejected') | Статус модерации |

### Vacancy (`vacancies`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| enterpriseId | UUID FK → enterprises.id | Предприятие |
| title | STRING(255) | Название вакансии |
| department | STRING(255) | Отдел / цех |
| employmentType | ENUM('full_time','internship','practice','shift') | Тип занятости |
| salaryFrom | INTEGER | Зарплата от |
| salaryTo | INTEGER | Зарплата до |
| schedule | STRING(128) | График работы |
| requirements | TEXT | Требования к кандидату |
| responsibilities | TEXT | Обязанности |
| benefits | TEXT | Преимущества / бонусы |
| medicalRequirements | TEXT | Медицинские требования |
| isStudentAvailable | BOOLEAN | Доступно для студентов |
| publishedAt | DATE | Дата публикации |
| status | ENUM('draft','published','archived') | Статус |

### AssessmentSession (`assessment_sessions`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор сессии |
| userId | UUID FK → users.id | Пользователь |
| roleContext | ENUM('seeker','student') | Контекст опроса |
| status | ENUM('in_progress','completed') | Статус |
| scoreJson | JSONB | Сводные баллы (результат матчинга) |
| completedAt | DATE | Дата завершения |

### AssessmentAnswer (`assessment_answers`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| sessionId | UUID FK → assessment_sessions.id | Сессия ассессмента |
| questionCode | STRING(64) | Код вопроса (q1, q2, ...) |
| answerValue | JSONB | Значение ответа (boolean, string, object) |
| weight | DECIMAL(5,2) | Вес вопроса |

### MatchResult (`match_results`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| sessionId | UUID FK → assessment_sessions.id | Сессия ассессмента |
| enterpriseId | UUID FK → enterprises.id | Предприятие |
| vacancyId | UUID FK → vacancies.id (nullable) | Вакансия |
| matchScore | DECIMAL(5,2) | Итоговый балл совместимости (0–100) |
| explanation | TEXT | Текстовое пояснение |
| factors | JSONB | Массив факторов с весами (для детализации) |
| rankOrder | INTEGER | Порядок ранжирования |

### Tour (`tours`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| enterpriseId | UUID FK → enterprises.id | Предприятие |
| title | STRING(255) | Название экскурсии |
| format | ENUM('offline','online') | Формат |
| description | TEXT | Описание |
| startAt | DATE | Дата и время начала |
| endAt | DATE | Дата и время окончания |
| capacity | INTEGER | Вместимость (макс. участников) |
| status | ENUM('planned','open','closed','cancelled') | Статус |

### TourBooking (`tour_bookings`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор брони |
| tourId | UUID FK → tours.id | Экскурсия |
| userId | UUID FK → users.id | Пользователь |
| status | ENUM('new','confirmed','cancelled','visited') | Статус брони |
| comment | TEXT | Комментарий пользователя |

### Application (`applications`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| userId | UUID FK → users.id | Пользователь |
| vacancyId | UUID FK → vacancies.id | Вакансия |
| type | ENUM('job_application','practice_application') | Тип отклика |
| coverNote | TEXT | Сопроводительное письмо |
| status | ENUM('new','viewed','invited','rejected','hired') | Статус отклика |

### Message (`messages`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор |
| threadId | UUID FK → message_threads.id | Тред |
| senderId | UUID FK → users.id | Отправитель |
| content | TEXT | Содержимое сообщения |
| isRead | BOOLEAN | Прочитано ли сообщение |

### MessageThread (`message_threads`)

| Поле | Тип | Описание |
|------|-----|----------|
| id | UUID PK | Идентификатор треда |
| userId | UUID FK → users.id | Участник-соискатель |
| enterpriseId | UUID FK → enterprises.id | Предприятие |
| vacancyId | UUID FK → vacancies.id (nullable) | Вакансия (контекст переписки) |
| lastMessageAt | DATE | Время последнего сообщения |

### Ассоциации (ключевые связи)

```
User 1:1 UserProfile
User 1:N AssessmentSession
User 1:N TourBooking
User 1:N Application
User 1:N Message (as sender)
User 1:N MessageThread (as participant)

Enterprise 1:N Vacancy
Enterprise 1:N Tour
Enterprise 1:N MatchResult
Enterprise 1:N MessageThread
Enterprise 1:N User (enterprise_user)

AssessmentSession 1:N AssessmentAnswer
AssessmentSession 1:N MatchResult

Vacancy 1:N MatchResult
Vacancy 1:N Application
Vacancy 1:N MessageThread

Tour 1:N TourBooking

MessageThread 1:N Message
```

---

## API-маршруты

Базовый префикс: `/api/v1`

### Аутентификация (`/api/v1/auth`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/register` | — | Регистрация нового пользователя |
| POST | `/login` | — | Вход в систему (возвращает access + refresh токены) |
| POST | `/refresh-token` | — | Обновление access-токена по refresh-токену |
| POST | `/verify-email` | + | Подтверждение email |

### Профиль пользователя (`/api/v1/profile`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/` | + | Получение профиля |
| PATCH | `/` | + | Обновление профиля |
| POST | `/role` | + | Установка роли (seeker / student) |

### Ассессмент (`/api/v1/assessment`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/questions` | — | Получение списка вопросов |
| POST | `/start` | + | Начать сессию ассессмента |
| POST | `/:sessionId/answer` | + | Отправить ответ на вопрос |
| POST | `/:sessionId/complete` | + | Завершить сессию и запустить вычисление рекомендаций |

### Рекомендации (`/api/v1/recommendations`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/generate` | + | Принудительная генерация рекомендаций |
| GET | `/` | + | Получение списка рекомендаций для пользователя |

### Предприятия (публичные) (`/api/v1/enterprises`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/` | опц. | Список всех предприятий |
| GET | `/:slug` | опц. | Детальная информация по slug |
| POST | `/` | — | Создание предприятия |
| PATCH | `/:id` | — | Обновление предприятия |

### Вакансии (публичные) (`/api/v1/vacancies`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/` | опц. | Список всех вакансий |
| GET | `/:id` | опц. | Детали вакансии |

### Экскурсии (публичные) (`/api/v1/tours`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| GET | `/` | опц. | Список всех экскурсий |
| GET | `/:id` | опц. | Детали экскурсии |
| POST | `/` | + | Создание экскурсии |
| POST | `/:id/book` | + | Бронирование экскурсии |
| GET | `/me/bookings` | + | Бронирования текущего пользователя |
| DELETE | `/bookings/:id` | + | Отмена бронирования |
| GET | `/enterprise/bookings` | + | Бронирования предприятия (HR) |

### Отклики (`/api/v1/applications`)

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/` | + | Создание отклика на вакансию |
| GET | `/me` | + | Отклики текущего пользователя |
| GET | `/enterprise` | + | Отклики для предприятия пользователя |
| PATCH | `/:id/status` | + | Изменение статуса отклика |

### Личный кабинет предприятия (`/api/v1/enterprise`)

*Все маршруты требуют роли `enterprise_user` и проверку принадлежности к предприятию.*

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/dashboard` | Дашборд со статистикой |
| GET | `/profile` | Получение профиля предприятия |
| PATCH | `/profile` | Обновление профиля предприятия |
| GET | `/vacancies` | Список вакансий предприятия |
| POST | `/vacancies` | Создание вакансии |
| PUT | `/vacancies/:id` | Обновление вакансии |
| DELETE | `/vacancies/:id` | Удаление вакансии |
| GET | `/applications` | Отклики на вакансии предприятия |
| PATCH | `/applications/:id/status` | Смена статуса отклика |
| GET | `/tours` | Список экскурсий предприятия |
| POST | `/tours` | Создание экскурсии |
| GET | `/tours/bookings` | Все бронирования на экскурсии предприятия |
| GET | `/tours/:id/bookings` | Бронирования конкретной экскурсии |
| PUT | `/tours/:id` | Обновление экскурсии |
| GET | `/tours/:id` | Детали экскурсии |
| DELETE | `/tours/:id` | Удаление экскурсии |
| PATCH | `/tours/:tourId/bookings/:bookingId/status` | Смена статуса брони |

### Общие

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Health check (статус сервера) |

---

## Ключевые бизнес-процессы

### 1. Профориентация и рекомендации

1. Пользователь регистрируется, заполняет профиль, выбирает роль (seeker / student)
2. Начинает сессию ассессмента (`POST /assessment/start`)
3. Поэтапно отвечает на вопросы (`POST /assessment/:sessionId/answer`)
4. Завершает ассессмент (`POST /assessment/:sessionId/complete`)
5. Запрашивает рекомендации (`POST /recommendations/generate` или `GET /recommendations`)
6. **MatchingService** (см. `backend/src/services/matchingService.js`):
   - Пытается вызвать внешнюю Evaluation API (LLM) с профилем и ответами пользователя
   - При недоступности внешнего сервиса использует встроенную fallback-логику скоринга (по городу, зарплате, графику, готовности к переезду)
   - Результаты (MatchResult) сохраняются в БД и возвращаются пользователю
7. Рекомендации кешируются на 1 час

### 2. Отклик на вакансию

1. Пользователь находит подходящую вакансию
2. Подаёт отклик с сопроводительным письмом
3. HR предприятия видит отклик в личном кабинете и меняет его статус

### 3. Управление экскурсиями

1. HR создаёт экскурсию (офлайн/онлайн) с датой и вместимостью
2. Пользователи видят доступные экскурсии и бронируют их
3. HR подтверждает бронь или отмечает посещение

### 4. Процесс модерации предприятия

1. Предприятие создаётся со статусом `draft`
2. После наполнения — переводится на модерацию (`pending`)
3. Суперадмин утверждает (`approved`) или отклоняет (`rejected`)

---

## Стейт-менеджмент (Frontend)

Используется **Zustand 5** с двумя основными сторами:

### authStore
- `user` — данные аутентифицированного пользователя
- `isAuthenticated` — флаг аутентификации
- `login(credentials)` — вход
- `logout()` — выход

### assessmentStore
- `sessionId` — текущая сессия ассессмента
- `questions` — список вопросов
- `answers` — карта ответов
- `recommendations` — полученные рекомендации
- `startAssessment()`, `answerQuestion()`, `completeAssessment()` — методы

---

## Работа с внешним API

**MatchingService** интегрируется с внешней Evaluation API для генерации более качественных рекомендаций на основе LLM.

**Запрос** (POST к внешнему сервису):
```json
{
  "userId": "uuid",
  "userProfile": {
    "city": "Екатеринбург",
    "age": 28,
    "desiredPosition": "Оператор станков с ЧПУ",
    "salary": { "from": 70000, "to": 95000 }
  },
  "assessmentAnswers": [
    { "questionCode": "q1", "answer": "Сменный график" }
  ],
  "enterpriseIds": [],
  "vacancyIds": []
}
```

**Ответ**:
```json
{
  "recommendations": [
    {
      "enterpriseId": "uuid",
      "vacancyId": "uuid",
      "matchScore": 87,
      "explanation": "Подходит по графику и зарплате",
      "factors": [
        { "name": "location", "weight": 0.9 },
        { "name": "salary", "weight": 0.85 }
      ]
    }
  ]
}
```

**Timeout**: 10 секунд. При ошибке — fallback на встроенный `basicScoring()`.

---

## Запуск и настройка

### Локальный запуск (без Docker)

**Backend:**
```bash
cd backend
cp .env.example .env          # Настройка переменных
npm install
npm run db:seed              # Наполнение тестовыми данными
npm run dev                  # Запуск на http://localhost:3000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env          # Настройка переменных
npm install
npm run dev                  # Запуск на http://localhost:5173
```

### Docker

```bash
docker-compose up --build
```

Подробнее — в `DOCKER_README.md`.

### Тестовые аккаунты (после seed)

| Email | Пароль | Роль |
|-------|--------|------|
| seeker1@test.local | password123 | Соискатель |
| seeker2@test.local | password123 | Соискатель |
| student1@test.local | password123 | Студент |
| hr1@zavod.local | password123 | HR предприятия |
| admin@test.local | password123 | Суперадмин |

---

## Реализованные доработки

- [x] **Мессенджер** — сообщения между соискателем и предприятием (REST + WebSocket, fullstack)
- [x] **Цифровой паспорт** соискателя — страница с профилем, рекомендациями, откликами, бронированиями, скачиванием PDF
- [x] **Управление LLM-конфигурациями** — суперадмин может создавать/редактировать/активировать/тестировать конфигурации через админ-панель
- [x] **Логирование запросов к LLM** — все запросы и ответы логируются, доступны для просмотра и очистки в админ-панели
- [x] **Настройка вопросов ассессмента** — суперадмин может создавать/редактировать/удалять/сортировать вопросы через drag-and-drop
- [x] **Конверсионная воронка** в дашборде предприятия — отслеживание пути от экскурсии до найма
- [x] **Модерация предприятий** — интерфейс для суперадмина (страница-заглушка)

## Планируемые доработки

- [ ] **Пагинация** в API (enterprises, vacancies, tours)
- [ ] **Поиск и фильтрация** вакансий и предприятий
- [ ] **Email-уведомления** (через Nodemailer — настроено, но не интегрировано)
- [ ] **3D-туры по предприятиям** (концептуально заложено в архитектуру)
- [ ] **Интеграция с внешними системами учёта**
- [ ] **PostgreSQL** в production (сейчас SQLite для разработки)
- [ ] **Ленивая загрузка страниц** (React.lazy + Suspense)
- [ ] **Winston-логирование** в файл (настроено, требуется донастройка ротации)
- [ ] **Unit-тесты** и **e2e-тесты**

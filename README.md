# Akcelerator-02 — Платформа профориентации и трудоустройства на промышленные предприятия

## Обзор проекта

**Akcelerator-02** — веб-приложение для профориентации, оценки компетенций и трудоустройства соискателей (включая студентов) на промышленные предприятия. Платформа выступает связующим звеном между кандидатами и работодателями: пользователи проходят диагностику, получают персонализированные рекомендации по вакансиям и экскурсиям, подают отклики, бронируют туры на предприятия и общаются с представителями компаний через встроенный мессенджер.

Проект построен на архитектуре **клиент-сервер**:
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 4 + Zustand
- **Backend**: Node.js (Express 5) + Sequelize ORM (SQLite) + JWT

---

## Содержание

1. [Функционал](#функционал)
2. [Роли пользователей и сценарии](#роли-пользователей-и-сценарии)
3. [Структура проекта](#структура-проекта)
4. [Схемы данных (модели)](#схемы-данных-модели)
5. [API-маршруты](#api-маршруты)
6. [Запуск и настройка](#запуск-и-настройка)

---

## Функционал

### Для соискателей (seeker) и студентов (student)

- **Регистрация и аутентификация** (JWT, access/refresh токены)
- **Заполнение расширенного профиля** (ФИО, телефон, город, возраст, желаемая должность, зарплатные ожидания, график работы, готовность к переезду, опыт работы, образование)
- **Профориентационное тестирование** — набор вопросов с весовыми коэффициентами. По результатам генерируются рекомендации
- **Рекомендации вакансий и предприятий** — автоматический подбор на основе ответов ассессмента (встроенный алгоритм или внешняя LLM)
- **Каталог предприятий** — просмотр детальной информации (описание, условия труда, безопасность, медосмотры, коллективный договор)
- **Каталог вакансий** — просмотр и фильтрация вакансий
- **Каталог экскурсий** — просмотр доступных экскурсий (офлайн/онлайн)
- **Подача откликов на вакансии** — с сопроводительным письмом
- **Бронирование экскурсий** на предприятия
- **Личный кабинет** — дашборд с откликами, бронированиями, рекомендациями, профилем
- **Цифровой паспорт** — сводка профиля соискателя в формате PDF
- **Мессенджер** — общение с представителями предприятий (REST + WebSocket)

### Для предприятий (enterprise_user / HR)

- **Дашборд** со статистикой (вакансии, отклики, экскурсии, воронка конверсии)
- **Редактирование профиля предприятия** — описание, условия труда, безопасность, контакты
- **Редактирование личного профиля** — ФИО, телефон, город, опыт и т.д.
- **Управление вакансиями** — создание, редактирование, публикация, архивация
- **Управление откликами** — просмотр, смена статуса (новый, просмотрено, приглашён, отклонён, нанят)
- **Управление экскурсиями** — создание, редактирование, указание формата, даты, вместимости
- **Управление бронированиями** — подтверждение, отмена, отметка о посещении
- **Воронка конверсии** — отслеживание пути от экскурсии до найма

### Для администратора (superadmin)

- **Управление пользователями** — просмотр всех пользователей, фильтрация по статусу, изменение статуса (активен/заблокирован/на рассмотрении), смена роли
- **Управление HR** — назначение пользователя HR-ом конкретного предприятия, снятие с должности
- **Модерация предприятий** — просмотр заявок на модерацию, одобрение или отклонение
- **Настройка LLM** — создание, редактирование, активация, тестирование конфигураций
- **Настройка вопросов ассессмента** — создание, редактирование, удаление, сортировка вопросов
- **Лог запросов к LLM** — просмотр и очистка
- **Смена роли пользователя** — возможность назначить любую роль любому пользователю

---

## Роли пользователей и сценарии

| Роль | Описание | Основные сценарии |
|------|----------|-------------------|
| `seeker` | Соискатель рабочей специальности | Прохождение ассессмента, просмотр рекомендаций, отклик на вакансии, бронь экскурсий, сообщения |
| `student` | Студент, ищущий практику или стажировку | Аналогично seeker, но с контекстом student и доступом к практикам |
| `enterprise_user` | Сотрудник предприятия (HR) | Управление вакансиями, экскурсиями, откликами, профилем предприятия и личным профилем |
| `superadmin` | Администратор платформы | Управление пользователями, HR, модерация предприятий, настройка LLM и вопросов |

### Как работает редирект по ролям

- **Соискатель/студент** после входа попадает в личный кабинет `/dashboard`
- **Администратор (superadmin)** после входа сразу попадает в админ-панель `/admin`
- **HR (enterprise_user)** после входа сразу попадает в панель предприятия `/enterprise/dashboard`
- При переходе на `/dashboard` также срабатывает редирект по роли

---

## Структура проекта

```
02/
├── backend/                          # Node.js / Express 5 сервер
│   ├── src/
│   │   ├── app.js                    # Точка входа: настройка middleware, роутов
│   │   ├── config/
│   │   │   ├── database.js           # Подключение Sequelize (SQLite)
│   │   │   └── env.js               # Чтение env-переменных
│   │   ├── models/                   # Модели Sequelize
│   │   ├── controllers/             # Контроллеры (обработчики запросов)
│   │   │   ├── adminController.js    # Админ-панель (пользователи, модерация, HR)
│   │   │   ├── enterpriseController.js # Панель предприятия
│   │   │   └── ...
│   │   ├── services/                # Сервисы (бизнес-логика)
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT-аутентификация, проверка ролей
│   │   │   └── errorHandler.js      # Глобальный обработчик ошибок
│   │   ├── routes/                  # Express-роутеры
│   │   └── db/
│   │       └── seeds.js             # Сид-скрипт (тестовые данные)
│   ├── server.js                    # Запуск сервера + синхронизация БД
│   ├── entrypoint.sh                # Точка входа контейнера (seed → сервер)
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                         # React 19 / Vite 8 клиент
│   ├── src/
│   │   ├── main.jsx                 # Точка входа React
│   │   ├── App.jsx                  # Роутер (React Router DOM v7)
│   │   ├── components/              # UI-компоненты
│   │   │   ├── Header.jsx           # Шапка (с навигацией по ролям)
│   │   │   ├── Footer.jsx           # Подвал
│   │   │   ├── LoginForm.jsx        # Форма входа (с тестовыми аккаунтами)
│   │   │   ├── RegisterForm.jsx     # Форма регистрации
│   │   │   └── ProtectedRoute.jsx   # Компонент защиты маршрутов по роли
│   │   ├── pages/                   # Страницы приложения
│   │   │   ├── admin/               # Страницы админ-панели
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UsersPage.jsx    # Управление пользователями
│   │   │   │   ├── ModerationPage.jsx # Модерация предприятий
│   │   │   │   ├── HrManagementPage.jsx # Управление HR
│   │   │   │   ├── LlmConfigPage.jsx
│   │   │   │   ├── AssessmentAdminPage.jsx
│   │   │   │   ├── LlmLogTab.jsx
│   │   │   │   └── ProfileTab.jsx
│   │   │   ├── enterprise/          # Страницы предприятия (HR)
│   │   │   │   ├── EnterpriseDashboardPage.jsx
│   │   │   │   ├── EnterpriseProfilePage.jsx # Редактирование профиля предприятия
│   │   │   │   ├── EnterpriseMyProfilePage.jsx # Редактирование личного профиля HR
│   │   │   │   ├── EnterpriseVacanciesPage.jsx
│   │   │   │   ├── EnterpriseVacancyFormPage.jsx # Создание/редактирование вакансии
│   │   │   │   ├── EnterpriseApplicationsPage.jsx
│   │   │   │   ├── EnterpriseToursPage.jsx
│   │   │   │   ├── EnterpriseTourFormPage.jsx
│   │   │   │   ├── EnterpriseTourBookingsPage.jsx
│   │   │   │   └── EnterpriseAllTourBookingsPage.jsx
│   │   │   ├── DashboardPage.jsx    # Личный кабинет соискателя
│   │   │   ├── ProfilePage.jsx      # Редактирование профиля
│   │   │   ├── home.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js               # Axios-клиент (перехват 401/403/500)
│   │   ├── store/
│   │   │   ├── authStore.js         # Состояние аутентификации
│   │   │   └── assessmentStore.js   # Состояние ассессмента
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml                # Docker Compose (единый контейнер)
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

### Остальные модели

AssessmentSession, AssessmentAnswer, MatchResult, Tour, TourBooking, Application, Message, MessageThread, LlmConfig, AssessmentQuestion — полные схемы см. в файлах `backend/src/models/`.

---

## API-маршруты

Базовый префикс: `/api/v1`

### Аутентификация (`/api/v1/auth`)
- `POST /register` — регистрация
- `POST /login` — вход (JWT access + refresh)
- `POST /refresh-token` — обновление токена

### Профиль (`/api/v1/profile`)
- `GET /` — получение профиля
- `PATCH /` — обновление профиля
- `POST /role` — установка роли

### Ассессмент (`/api/v1/assessment`)
- `GET /questions` — список вопросов
- `POST /start` — начать сессию
- `POST /:sessionId/answer` — ответить на вопрос
- `POST /:sessionId/complete` — завершить сессию

### Рекомендации (`/api/v1/recommendations`)
- `POST /generate` — генерация рекомендаций
- `GET /` — получение рекомендаций

### Предприятия (публичные, `/api/v1/enterprises`)
- `GET /` — список
- `GET /:slug` — детали по slug

### Вакансии (публичные, `/api/v1/vacancies`)
- `GET /` — список
- `GET /:id` — детали

### Экскурсии (публичные, `/api/v1/tours`)
- `GET /` — список
- `GET /:id` — детали
- `POST /:id/book` — бронирование
- `GET /me/bookings` — мои бронирования
- `DELETE /bookings/:id` — отмена брони

### Отклики (`/api/v1/applications`)
- `POST /` — создать отклик
- `GET /me` — мои отклики
- `DELETE /:id` — удалить отклик

### Панель предприятия (`/api/v1/enterprise`)
- `GET /dashboard` — статистика
- `GET/PATCH /profile` — профиль предприятия
- `GET/POST/PUT/DELETE /vacancies` — управление вакансиями
- `GET /applications` — отклики
- `PATCH /applications/:id/status` — смена статуса отклика
- `GET/POST/PUT/DELETE /tours` — управление экскурсиями
- `GET /tours/bookings` — все бронирования
- `GET /tours/:id/bookings` — бронирования экскурсии
- `PATCH /tours/:tourId/bookings/:bookingId/status` — смена статуса брони

### Админ-панель (`/api/v1/admin`)
- **Пользователи:** `GET /users`, `PATCH /users/:id/status`, `PATCH /users/:id/role`
- **HR:** `GET /hr`, `POST /hr/assign`, `DELETE /hr/:userId`
- **Модерация предприятий:** `GET /enterprises/moderation`, `PATCH /enterprises/:id/moderate`
- **LLM:** `GET/POST/PUT/DELETE /llm-config`, `PATCH /llm-config/:id/activate`, `POST /llm-config/:id/test`
- **Вопросы:** `GET/POST/PUT/DELETE /assessment-questions`, `PATCH /assessment-questions/:id/toggle`, `POST /assessment-questions/reorder`
- **Лог:** `GET/DELETE /llm-log`

### Сообщения (`/api/v1/messages`)
- `GET /threads` — список тредов
- `POST /threads` — создать тред
- `GET /threads/:id/messages` — сообщения треда
- `POST /threads/:id/messages` — отправить сообщение
- `PATCH /threads/:threadId/messages/:msgId/read` — отметить прочитанным

### Общие
- `GET /health` — health check

---

## Запуск и настройка

### Быстрый запуск (Docker)

```bash
docker compose up -d
```

Приложение будет доступно по адресу: http://localhost:25426

Контейнер автоматически:
1. Собирает статику фронтенда (vite build)
2. Устанавливает npm-зависимости бэкенда
3. Заполняет БД тестовыми данными (seed)
4. Запускает сервер

### Локальный запуск (без Docker)

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run db:seed
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Тестовые аккаунты (после seed)

| Email | Пароль | Роль | Примечание |
|-------|--------|------|------------|
| seeker1@test.local | password123 | Соискатель | Профиль заполнен, есть ассессмент |
| seeker2@test.local | password123 | Соискатель | Базовая регистрация |
| student1@test.local | password123 | Студент | Профиль студента |
| hr1@zavod.local | password123 | HR предприятия | Привязан к Северному машзаводу |
| admin@test.local | password123 | Администратор | Полный доступ к админке |
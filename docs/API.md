# API Documentation

## Base URL
`http://localhost:3000/api/v1`

## Authentication

All protected endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer {accessToken}
```

---

## Auth Endpoints

### Register
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Ivan Ivanov",
  "role": "seeker" | "student"
}

Response:
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "seeker",
    "status": "pending"
  }
}
```

### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: (same as Register)
```

### Refresh Token
```
POST /auth/refresh-token

Body:
{
  "refreshToken": "jwt..."
}

Response: (same as Login)
```

### Verify Email
```
POST /auth/verify-email
Headers: Authorization: Bearer {accessToken}

Response:
{
  "message": "Email verified",
  "user": { ... }
}
```

---

## Profile Endpoints

### Get Profile
```
GET /profile
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "seeker",
  "status": "active",
  "emailVerified": true,
  "profile": {
    "id": "uuid",
    "fullName": "Ivan Ivanov",
    "phone": "+79001234567",
    "city": "Moscow",
    "age": 28,
    "relocationReady": false,
    "desiredPosition": "Developer",
    "desiredSalaryFrom": 100000,
    "preferredSchedule": "5/2",
    "healthLimitations": null,
    ...
  }
}
```

### Update Profile
```
PATCH /profile
Headers: Authorization: Bearer {accessToken}

Body: (any profile field)
{
  "phone": "+79001234567",
  "city": "St. Petersburg",
  ...
}

Response: (updated profile)
```

### Set Role
```
POST /profile/role
Headers: Authorization: Bearer {accessToken}

Body:
{
  "role": "seeker" | "student" | "enterprise_user"
}

Response:
{
  "user": { ... }
}
```

---

## Assessment Endpoints

### Get Questions
```
GET /assessment/questions

Response:
{
  "questions": [
    {
      "code": "q1",
      "text": "Какой формат работы вам подходит?",
      "type": "single_choice",
      "options": ["Сменный график", "Пятидневка", "Вахта", "Не определился"]
    },
    ...
  ]
}
```

### Start Assessment
```
POST /assessment/start
Headers: Authorization: Bearer {accessToken}

Body:
{
  "roleContext": "seeker" | "student"
}

Response:
{
  "sessionId": "uuid",
  "questions": [ ... ]
}
```

### Answer Question
```
POST /assessment/{sessionId}/answer
Headers: Authorization: Bearer {accessToken}

Body:
{
  "questionCode": "q1",
  "answer": "Сменный график" | true | 4 | ["option1", "option2"]
}

Response:
{
  "id": "uuid",
  "sessionId": "uuid",
  "questionCode": "q1",
  "answerValue": { ... },
  "weight": 1.0
}
```

### Complete Assessment
```
POST /assessment/{sessionId}/complete
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "status": "completed",
  "scoreJson": { ... },
  "completedAt": "2024-01-01T12:00:00Z"
}
```

---

## Recommendations Endpoints

### Generate Recommendations
```
POST /recommendations/generate
Headers: Authorization: Bearer {accessToken}

Query Params:
- sessionId: uuid (required)
- region?: string
- salary?: number
- format?: string

Response:
{
  "count": 10,
  "recommendations": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "enterpriseId": "uuid",
      "vacancyId": "uuid",
      "matchScore": 87,
      "explanation": "Подходит по графику, зарплате и близости региона",
      "factors": [
        { "name": "location", "weight": 0.9 },
        { "name": "salary", "weight": 0.8 }
      ],
      "rankOrder": 0,
      "Enterprise": { ... },
      "Vacancy": { ... }
    },
    ...
  ]
}
```

### Get Recommendations
```
GET /recommendations
Headers: Authorization: Bearer {accessToken}

Query Params:
- sessionId: uuid (required)

Response:
{
  "count": 10,
  "recommendations": [ ... ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields" | "Validation error"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided" | "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "User not found" | "Session not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting. Will be added in production.

---

---

## Admin Endpoints (требуется роль superadmin)

### LLM Config

#### Get All Configs
```
GET /admin/llm-config
Headers: Authorization: Bearer {accessToken} (superadmin)

Response:
[
  {
    "id": "uuid",
    "name": "YandexGPT-main",
    "baseUrl": "https://llm.api.cloud.yandex.net/foundationModels/v1",
    "modelName": "yandexgpt-lite",
    "systemPrompt": "Ты — система профориентации...",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Create Config
```
POST /admin/llm-config
Headers: Authorization: Bearer {accessToken} (superadmin)

Body:
{
  "name": "YandexGPT-main",
  "baseUrl": "https://llm.api.cloud.yandex.net/foundationModels/v1",
  "apiToken": "токен_доступа",
  "modelName": "yandexgpt-lite",
  "systemPrompt": "Ты — система профориентации..."
}

Response: (config without apiToken)
```

#### Update Config
```
PUT /admin/llm-config/:id
Headers: Authorization: Bearer {accessToken} (superadmin)
Body: (partial fields)
```

#### Delete Config
```
DELETE /admin/llm-config/:id
Headers: Authorization: Bearer {accessToken} (superadmin)
Response: { "message": "Config deleted" }
```

#### Activate Config
```
PATCH /admin/llm-config/:id/activate
Headers: Authorization: Bearer {accessToken} (superadmin)
Response: (activated config, isActive=true, others set to false)
```

#### Test Connection
```
POST /admin/llm-config/:id/test
Headers: Authorization: Bearer {accessToken} (superadmin)

Response (success):
{
  "success": true,
  "response": "Да, я работаю!",
  "model": "yandexgpt-lite"
}

Response (error 502):
{
  "success": false,
  "error": "connect ECONNREFUSED",
  "details": {}
}
```

#### Get LLM Log
```
GET /admin/llm-log?limit=50
Headers: Authorization: Bearer {accessToken} (superadmin)

Response:
{
  "count": 3,
  "logs": [
    {
      "timestamp": "2026-06-03T22:00:00.000Z",
      "configName": "YandexGPT-main",
      "durationMs": 1234,
      "success": true,
      "request": { "model": "yandexgpt-lite", "messages": [...], "temperature": 0.3 },
      "response": { "model": "yandexgpt-lite", "content": "...", "usage": { "prompt_tokens": 500, "completion_tokens": 200 } }
    }
  ]
}
```

#### Clear LLM Log
```
DELETE /admin/llm-log
Headers: Authorization: Bearer {accessToken} (superadmin)
Response: { "message": "Log cleared" }
```

### Assessment Questions

#### Get All Questions
```
GET /admin/assessment-questions
Headers: Authorization: Bearer {accessToken} (superadmin)

Response:
[
  {
    "id": "uuid",
    "code": "q1",
    "text": "Кто вы?",
    "type": "single",
    "weight": 1.0,
    "optionsJson": [{ "value": "seeker", "label": "Соискатель" }, ...],
    "isActive": true,
    "sortOrder": 0
  }
]
```

#### Create Question
```
POST /admin/assessment-questions
Headers: Authorization: Bearer {accessToken} (superadmin)

Body:
{
  "code": "q11",
  "text": "Текст вопроса",
  "type": "single" | "multi",
  "weight": 1.0,
  "optionsJson": [{ "value": "opt1", "label": "Вариант 1", "freeText": false }],
  "isActive": true,
  "sortOrder": 10
}
```

#### Update Question
```
PUT /admin/assessment-questions/:id
Headers: Authorization: Bearer {accessToken} (superadmin)
Body: (partial fields)
```

#### Delete Question
```
DELETE /admin/assessment-questions/:id
Headers: Authorization: Bearer {accessToken} (superadmin)
Response: { "message": "Question deleted" }
```

#### Toggle Question Active Status
```
PATCH /admin/assessment-questions/:id/toggle
Headers: Authorization: Bearer {accessToken} (superadmin)
Response: (updated question with toggled isActive)
```

#### Reorder Questions
```
POST /admin/assessment-questions/reorder
Headers: Authorization: Bearer {accessToken} (superadmin)

Body:
{
  "items": [{ "id": "uuid1", "sortOrder": 0 }, { "id": "uuid2", "sortOrder": 1 }]
}

Response: (reordered list of questions)
```

---

## Messages Endpoints (требуется аутентификация)

### Get Threads
```
GET /messages/threads
Headers: Authorization: Bearer {accessToken}

Response:
{
  "threads": [
    {
      "id": "uuid",
      "userId": "uuid",
      "enterpriseId": "uuid",
      "vacancyId": "uuid | null",
      "lastMessageAt": "2026-06-03T22:00:00.000Z",
      "user": { "id": "uuid", "email": "user@example.com" },
      "enterprise": { "id": "uuid", "name": "Предприятие", "slug": "predpriyatie" },
      "vacancy": { "id": "uuid", "title": "Название вакансии" },
      "lastMessage": { "content": "Последнее сообщение", "createdAt": "...", "senderId": "uuid" },
      "unreadCount": 2
    }
  ]
}
```

### Create Thread
```
POST /messages/threads
Headers: Authorization: Bearer {accessToken}

Body:
{
  "enterpriseId": "uuid",
  "vacancyId": "uuid" (optional)
}

Response: (created thread)
```

### Get Messages
```
GET /messages/threads/:id/messages?page=1&limit=20
Headers: Authorization: Bearer {accessToken}

Response:
{
  "messages": [
    {
      "id": "uuid",
      "threadId": "uuid",
      "senderId": "uuid",
      "content": "Текст сообщения",
      "isRead": false,
      "createdAt": "2026-06-03T22:00:00.000Z",
      "sender": { "id": "uuid", "email": "user@example.com" }
    }
  ],
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

### Send Message
```
POST /messages/threads/:id/messages
Headers: Authorization: Bearer {accessToken}

Body:
{
  "content": "Текст сообщения"
}

Response: (created message with sender info)
```

### Mark Message as Read
```
PATCH /messages/threads/:threadId/messages/:msgId/read
Headers: Authorization: Bearer {accessToken}

Response: (updated message with isRead=true)
```

### Доступ по ролям:
- **seeker/student** — видят только свои треды (по userId)
- **enterprise_user** — видят треды своего предприятия (по enterpriseId)
- **superadmin** — не имеют доступа

---

## WebSocket

Подключение: `ws://localhost:5000/ws?userId={uuid}`

События:
- `new_message` — новое сообщение в треде (получают отправитель и получатель)


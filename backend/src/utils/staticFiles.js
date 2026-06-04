const express = require('express');
const path = require('path');

/**
 * Настройка раздачи статических файлов
 * - /uploads — загруженные файлы
 * - /assets, /favicon.ico и т.д. — статика фронтенда
 * - Все остальные маршруты (кроме /api, /uploads, /health, /ws) отдают index.html (SPA)
 * 
 * @param {import('express').Express} app - Express-приложение
 */
function configureStaticFiles(app) {
  const uploadsPath = path.join(__dirname, '..', '..', 'public', 'uploads');
  const frontendDistPath = path.join(__dirname, '..', '..', 'public');

  // Раздача загруженных файлов
  app.use('/uploads', express.static(uploadsPath, {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
      };
      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
      }
    },
  }));

  // Раздача статики фронтенда (собранные assets)
  app.use('/assets', express.static(path.join(frontendDistPath, 'assets'), {
    maxAge: '30d',
    etag: true,
    lastModified: true,
  }));

  // SPA fallback — для всех маршрутов, не начинающихся с /api, /uploads, /ws, /health
  // отдаём index.html, чтобы React Router работал корректно
  // Используем middleware вместо app.get('*'), т.к. Express 5 не поддерживает паттерн '*'
  app.use((req, res, next) => {
    // Если запрос начинается с /api, /uploads, /ws или /health — пропускаем
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/ws') ||
      req.path.startsWith('/health')
    ) {
      return next();
    }
    // Если запрос на /favicon.ico — отдаём его
    if (req.path === '/favicon.ico') {
      return res.sendFile(path.join(frontendDistPath, 'favicon.ico'));
    }
    // Иначе — отдаём index.html
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

module.exports = configureStaticFiles;
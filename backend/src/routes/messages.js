const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authMiddleware } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Threads
router.get('/threads', messageController.getThreads);
router.post('/threads', messageController.createThread);

// Messages
router.get('/threads/:id/messages', messageController.getMessages);
router.post('/threads/:id/messages', messageController.sendMessage);
router.patch('/threads/:threadId/messages/:msgId/read', messageController.markAsRead);

module.exports = router;
const messageService = require('../services/messageService');

class MessageController {
  // ========== Threads ==========

  async getThreads(req, res, next) {
    try {
      const { id: userId, role: userRole, enterpriseId } = req.user;
      const threads = await messageService.getThreads(userId, userRole, enterpriseId);
      res.json({ threads });
    } catch (error) {
      next(error);
    }
  }

  async createThread(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { enterpriseId, vacancyId } = req.body;

      if (!enterpriseId) {
        return res.status(400).json({ error: 'enterpriseId is required' });
      }

      const thread = await messageService.createThread(userId, enterpriseId, vacancyId);
      res.status(201).json(thread);
    } catch (error) {
      next(error);
    }
  }

  // ========== Messages ==========

  async getMessages(req, res, next) {
    try {
      const { id: userId, role: userRole, enterpriseId } = req.user;
      const { id: threadId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await messageService.getMessages(threadId, userId, userRole, enterpriseId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { id: senderId, role: userRole, enterpriseId } = req.user;
      const { id: threadId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const message = await messageService.sendMessage(threadId, senderId, content, userRole, enterpriseId);
      res.status(201).json(message);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id: userId } = req.user;
      const { threadId, msgId } = req.params;

      const message = await messageService.markAsRead(threadId, msgId, userId);
      res.json(message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
const { Op } = require('sequelize');
const { MessageThread, Message, User, Enterprise, Vacancy } = require('../models');
const { getWsClients } = require('../ws'); // будет создан ниже

class MessageService {
  // ========== Threads ==========

  async getThreads(userId, userRole, enterpriseId) {
    const where = {};
    if (userRole === 'enterprise_user') {
      where.enterpriseId = enterpriseId;
    } else {
      where.userId = userId;
    }

    const threads = await MessageThread.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'email'] },
        { model: Enterprise, as: 'enterprise', attributes: ['id', 'name', 'slug'] },
        { model: Vacancy, attributes: ['id', 'title'] },
      ],
      order: [['lastMessageAt', 'DESC']],
    });

    // Добавляем последнее сообщение и количество непрочитанных
    const result = [];
    for (const thread of threads) {
      const lastMessage = await Message.findOne({
        where: { threadId: thread.id },
        order: [['createdAt', 'DESC']],
      });
      const unreadCount = await Message.count({
        where: { threadId: thread.id, isRead: false, senderId: { [Op.ne]: userId } },
      });
      result.push({
        ...thread.toJSON(),
        lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt, senderId: lastMessage.senderId } : null,
        unreadCount,
      });
    }

    return result;
  }

  async createThread(userId, enterpriseId, vacancyId) {
    // Проверяем, существует ли уже тред между этими пользователем и предприятием
    let thread = await MessageThread.findOne({
      where: { userId, enterpriseId },
    });

    if (!thread) {
      thread = await MessageThread.create({
        userId,
        enterpriseId,
        vacancyId: vacancyId || null,
        lastMessageAt: new Date(),
      });
    } else if (vacancyId) {
      thread.vacancyId = vacancyId;
      await thread.save();
    }

    return thread;
  }

  // ========== Messages ==========

  async getMessages(threadId, userId, userRole, enterpriseId, page = 1, limit = 20) {
    const thread = await MessageThread.findByPk(threadId);
    if (!thread) throw { statusCode: 404, message: 'Thread not found' };

    // Проверка доступа
    if (userRole !== 'enterprise_user' && thread.userId !== userId) {
      throw { statusCode: 403, message: 'Access denied' };
    }
    if (userRole === 'enterprise_user' && thread.enterpriseId !== enterpriseId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    const offset = (page - 1) * limit;
    const messages = await Message.findAndCountAll({
      where: { threadId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'email'] }],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    return {
      messages: messages.rows.reverse(),
      total: messages.count,
      page,
      totalPages: Math.ceil(messages.count / limit),
    };
  }

  async sendMessage(threadId, senderId, content, userRole, enterpriseId) {
    const thread = await MessageThread.findByPk(threadId);
    if (!thread) throw { statusCode: 404, message: 'Thread not found' };

    // Проверка доступа
    if (userRole !== 'enterprise_user' && thread.userId !== senderId) {
      throw { statusCode: 403, message: 'Access denied' };
    }
    if (userRole === 'enterprise_user' && thread.enterpriseId !== enterpriseId) {
      throw { statusCode: 403, message: 'Access denied' };
    }

    const message = await Message.create({
      threadId,
      senderId,
      content,
      isRead: false,
    });

    // Обновляем lastMessageAt
    thread.lastMessageAt = new Date();
    await thread.save();

    // Загружаем отправителя для ответа
    const sender = await User.findByPk(senderId, { attributes: ['id', 'email'] });

    const result = { ...message.toJSON(), sender };

    // Оповещаем через WebSocket
    try {
      const wsClients = getWsClients();
      if (wsClients) {
        const recipientId = userRole === 'enterprise_user' ? thread.userId : `enterprise_${thread.enterpriseId}`;
        wsClients.forEach((client) => {
          if (client.userId === recipientId || client.userId === senderId) {
            client.send(JSON.stringify({ type: 'new_message', data: result }));
          }
        });
      }
    } catch (e) {
      console.error('WebSocket notification error:', e.message);
    }

    return result;
  }

  async markAsRead(threadId, msgId, userId) {
    const message = await Message.findByPk(msgId);
    if (!message) throw { statusCode: 404, message: 'Message not found' };
    if (message.threadId !== threadId) throw { statusCode: 400, message: 'Message does not belong to this thread' };

    // Отмечаем как прочитанное только если пользователь — получатель
    const thread = await MessageThread.findByPk(threadId);
    if (message.senderId !== userId) {
      message.isRead = true;
      await message.save();
    }

    return message;
  }
}

module.exports = new MessageService();
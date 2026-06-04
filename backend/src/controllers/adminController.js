const { LlmConfig, AssessmentQuestion } = require('../models');
const axios = require('axios');
const llmLogger = require('../services/llmLogger');

class AdminController {
  // ========== LLM Config CRUD ==========

  async getLlmConfigs(req, res, next) {
    try {
      const configs = await LlmConfig.findAll({
        attributes: { exclude: ['apiToken'] },
        order: [['createdAt', 'DESC']],
      });
      res.json(configs);
    } catch (error) {
      next(error);
    }
  }

  async createLlmConfig(req, res, next) {
    try {
      const { name, baseUrl, apiToken, modelName, systemPrompt } = req.body;

      if (!name || !baseUrl || !apiToken || !modelName) {
        return res.status(400).json({ error: 'name, baseUrl, apiToken, modelName are required' });
      }

      const config = await LlmConfig.create({
        name,
        baseUrl,
        apiToken,
        modelName,
        systemPrompt: systemPrompt || '',
        isActive: false,
      });

      // Не возвращаем токен в ответе
      const result = config.toJSON();
      delete result.apiToken;

      res.status(201).json(result);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Config with this name already exists' });
      }
      next(error);
    }
  }

  async updateLlmConfig(req, res, next) {
    try {
      const { id } = req.params;
      const config = await LlmConfig.findByPk(id);

      if (!config) {
        return res.status(404).json({ error: 'Config not found' });
      }

      const { name, baseUrl, apiToken, modelName, systemPrompt } = req.body;

      if (name !== undefined) config.name = name;
      if (baseUrl !== undefined) config.baseUrl = baseUrl;
      if (apiToken !== undefined) config.apiToken = apiToken;
      if (modelName !== undefined) config.modelName = modelName;
      if (systemPrompt !== undefined) config.systemPrompt = systemPrompt;

      await config.save();

      const result = config.toJSON();
      delete result.apiToken;

      res.json(result);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Config with this name already exists' });
      }
      next(error);
    }
  }

  async deleteLlmConfig(req, res, next) {
    try {
      const { id } = req.params;
      const config = await LlmConfig.findByPk(id);

      if (!config) {
        return res.status(404).json({ error: 'Config not found' });
      }

      await config.destroy();
      res.json({ message: 'Config deleted' });
    } catch (error) {
      next(error);
    }
  }

  async activateLlmConfig(req, res, next) {
    try {
      const { id } = req.params;
      const config = await LlmConfig.findByPk(id);

      if (!config) {
        return res.status(404).json({ error: 'Config not found' });
      }

      // Сбросить isActive у всех
      await LlmConfig.update({ isActive: false }, { where: {} });

      // Активировать выбранную
      config.isActive = true;
      await config.save();

      const result = config.toJSON();
      delete result.apiToken;

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async testLlmConfig(req, res, next) {
    try {
      const { id } = req.params;
      const config = await LlmConfig.findByPk(id);

      if (!config) {
        return res.status(404).json({ error: 'Config not found' });
      }

      const response = await axios.post(
        `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`,
        {
          model: config.modelName,
          messages: [
            { role: 'system', content: config.systemPrompt || 'Ты — помощник по профориентации.' },
            { role: 'user', content: 'Ответь коротко: ты работаешь?' },
          ],
          max_tokens: 50,
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      res.json({
        success: true,
        response: response.data?.choices?.[0]?.message?.content || 'No response content',
        model: response.data?.model || config.modelName,
      });
    } catch (error) {
      res.status(502).json({
        success: false,
        error: error.message,
        details: error.response?.data || 'Connection failed',
      });
    }
  }
  // ========== Assessment Questions CRUD ==========

  async getAssessmentQuestions(req, res, next) {
    try {
      const questions = await AssessmentQuestion.findAll({
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      });
      res.json(questions);
    } catch (error) {
      next(error);
    }
  }

  async createAssessmentQuestion(req, res, next) {
    try {
      const { code, text, type, weight, optionsJson, isActive, sortOrder } = req.body;

      if (!code || !text) {
        return res.status(400).json({ error: 'code and text are required' });
      }

      const question = await AssessmentQuestion.create({
        code,
        text,
        type: type || 'single',
        weight: weight || 1.0,
        optionsJson: optionsJson || [],
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      });

      res.status(201).json(question);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Question with this code already exists' });
      }
      next(error);
    }
  }

  async updateAssessmentQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const question = await AssessmentQuestion.findByPk(id);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const { code, text, type, weight, optionsJson, isActive, sortOrder } = req.body;

      if (code !== undefined) question.code = code;
      if (text !== undefined) question.text = text;
      if (type !== undefined) question.type = type;
      if (weight !== undefined) question.weight = weight;
      if (optionsJson !== undefined) question.optionsJson = optionsJson;
      if (isActive !== undefined) question.isActive = isActive;
      if (sortOrder !== undefined) question.sortOrder = sortOrder;

      await question.save();
      res.json(question);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Question with this code already exists' });
      }
      next(error);
    }
  }

  async deleteAssessmentQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const question = await AssessmentQuestion.findByPk(id);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      await question.destroy();
      res.json({ message: 'Question deleted' });
    } catch (error) {
      next(error);
    }
  }

  async toggleAssessmentQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const question = await AssessmentQuestion.findByPk(id);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }

      question.isActive = !question.isActive;
      await question.save();
      res.json(question);
    } catch (error) {
      next(error);
    }
  }

  // ========== LLM Request Log ==========

  async getLlmLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const logs = await llmLogger.getLogs(limit);
      res.json({ count: logs.length, logs });
    } catch (error) {
      next(error);
    }
  }

  async clearLlmLogs(req, res, next) {
    try {
      await llmLogger.clearLogs();
      res.json({ message: 'Log cleared' });
    } catch (error) {
      next(error);
    }
  }

  async reorderAssessmentQuestions(req, res, next) {
    try {
      const { items } = req.body; // [{id, sortOrder}]

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'items array required' });
      }

      for (const item of items) {
        await AssessmentQuestion.update(
          { sortOrder: item.sortOrder },
          { where: { id: item.id } }
        );
      }

      const questions = await AssessmentQuestion.findAll({
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      });

      res.json(questions);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();

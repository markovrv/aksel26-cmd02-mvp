const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', 'logs', 'llm-requests.log');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Сервис для логирования запросов к LLM и ответов
 */
class LlmLogger {
  /**
   * Логировать запрос к LLM и ответ
   * @param {Object} params
   * @param {string} params.configName - название конфигурации LLM
   * @param {Object} params.request - данные запроса (URL, модель, сообщения)
   * @param {Object} params.response - ответ от LLM
   * @param {number} params.durationMs - длительность запроса в мс
   * @param {boolean} params.success - успешен ли запрос
   * @param {string} [params.error] - сообщение об ошибке, если была
   */
  async log(params) {
    const { configName, request, response, durationMs, success, error } = params;

    const entry = {
      timestamp: new Date().toISOString(),
      configName: configName || 'unknown',
      durationMs,
      success,
      error: error || null,
      request: {
        model: request?.model,
        messages: request?.messages,
        temperature: request?.temperature,
        maxTokens: request?.max_tokens,
      },
      response: success ? {
        model: response?.model,
        content: response?.choices?.[0]?.message?.content?.substring(0, 10000) || response?.choices?.[0]?.message?.reasoning_content?.substring(0, 10000) || '(empty)',
        usage: response?.usage || null,
        raw: response ? JSON.stringify(response).substring(0, 5000) : null,
      } : null,
      rawContent: success ? ((response?.choices?.[0]?.message?.content || response?.choices?.[0]?.message?.reasoning_content || '')).substring(0, 10000) : null,
    };

    try {
      await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });

      // Проверяем размер файла — если превышает лимит, архивируем
      try {
        const stats = await fs.promises.stat(LOG_FILE);
        if (stats.size > MAX_LOG_SIZE) {
          const archived = LOG_FILE.replace('.log', `-${Date.now()}.log`);
          await fs.promises.rename(LOG_FILE, archived);
        }
      } catch { /* файл ещё не существует */ }

      const line = JSON.stringify(entry) + '\n';
      await fs.promises.appendFile(LOG_FILE, line, 'utf8');
    } catch (err) {
      console.error('Failed to write LLM log:', err.message);
    }
  }

  /**
   * Прочитать все записи из лога (последние N записей)
   * @param {number} limit - максимальное количество записей
   * @returns {Array} массив записей лога
   */
  async getLogs(limit = 100) {
    try {
      await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });

      const data = await fs.promises.readFile(LOG_FILE, 'utf8');
      const lines = data.trim().split('\n').filter(Boolean);
      const entries = lines.map(line => {
        try { return JSON.parse(line); } catch { return null; }
      }).filter(Boolean);

      // Сортируем по timestamp (новые сверху) и ограничиваем
      entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return entries.slice(0, limit);
    } catch {
      return [];
    }
  }

  /**
   * Очистить лог
   */
  async clearLogs() {
    try {
      await fs.promises.mkdir(path.dirname(LOG_FILE), { recursive: true });
      await fs.promises.writeFile(LOG_FILE, '', 'utf8');
    } catch (err) {
      console.error('Failed to clear LLM log:', err.message);
    }
  }
}

module.exports = new LlmLogger();
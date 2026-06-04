import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

export default function LlmLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getLlmLogs(50);
      setLogs(data.logs || []);
    } catch (err) {
      toast.error('Ошибка загрузки лога');
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Очистить лог запросов к LLM?')) return;
    try {
      await adminAPI.clearLlmLogs();
      setLogs([]);
      toast.success('Лог очищен');
    } catch (err) {
      toast.error('Ошибка очистки');
    }
  };

  if (loading) return <p>Загрузка лога...</p>;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button className="btn btn-secondary btn-sm" onClick={loadLogs}>Обновить</button>
        <button className="btn btn-danger btn-sm" onClick={clearLogs}>Очистить лог</button>
        <span className="text-sm text-gray-500 ml-auto">Всего записей: {logs.length}</span>
      </div>

      {logs.length === 0 && <p className="text-gray-500">Лог пуст. Запросы к LLM появятся здесь после генерации рекомендаций.</p>}

      <div className="space-y-2">
        {logs.map((entry, i) => (
          <div key={`log-${entry.timestamp}-${i}`} className="border rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${entry.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {entry.success ? 'OK' : 'ERR'}
              </span>
              <span className="text-gray-500">{new Date(entry.timestamp).toLocaleString('ru-RU')}</span>
              <span className="text-gray-400">|</span>
              <span className="font-medium">{entry.configName}</span>
              <span className="text-gray-400">|</span>
              <span>{entry.durationMs}ms</span>
              <button
                className="ml-auto text-xs text-blue-600 hover:underline"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {expanded === i ? 'Свернуть' : 'Детали'}
              </button>
            </div>
            {entry.error && <p className="text-red-600 text-xs mb-1">Ошибка: {entry.error}</p>}
            {expanded === i && (
              <div className="mt-2 bg-gray-50 rounded p-2 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto">
                <p className="font-bold mb-1">Модель: {entry.request?.model}</p>
                <p className="font-bold mb-1">System prompt:</p>
                <div className="mb-2 p-1 bg-white rounded border">{entry.request?.messages?.[0]?.content || '—'}</div>
                <p className="font-bold mb-1">User message:</p>
                <div className="mb-2 p-1 bg-white rounded border">{entry.request?.messages?.[1]?.content || '—'}</div>
                {entry.response?.content && (
                  <>
                    <p className="font-bold mb-1">Ответ LLM:</p>
                    <div className="p-1 bg-white rounded border">{entry.response.content}</div>
                  </>
                )}
                {entry.response?.usage && (
                  <p className="mt-1 text-gray-500">Tokens: prompt={entry.response.usage.prompt_tokens}, completion={entry.response.usage.completion_tokens}, total={entry.response.usage.total_tokens}</p>
                )}
                <p className="mt-1 text-gray-400">Temperature: {entry.request?.temperature}, Max tokens: {entry.request?.maxTokens}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { messagesAPI, enterprisesAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEnterprisePicker, setShowEnterprisePicker] = useState(false);
  const [enterprises, setEnterprises] = useState([]);
  const [enterprisesLoading, setEnterprisesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const isHR = user?.role === 'enterprise_user';

  // Загрузка тредов
  const loadThreads = useCallback(async () => {
    try {
      const { data } = await messagesAPI.getThreads();
      setThreads(data.threads || []);
    } catch (e) {
      console.error('Failed to load threads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // Поллинг новых сообщений (каждые 5 секунд)
  useEffect(() => {
    if (!activeThread) return;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await messagesAPI.getMessages(activeThread.id, 1, 50);
        setMessages(data.messages || []);
        // Отмечаем как прочитанные
        (data.messages || []).forEach(msg => {
          if (!msg.isRead && msg.senderId !== user?.id) {
            messagesAPI.markAsRead(activeThread.id, msg.id).catch(() => {});
          }
        });
        loadThreads();
      } catch (e) {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeThread, user?.id, loadThreads]);

  // Загрузка сообщений треда
  const openThread = async (thread) => {
    setActiveThread(thread);
    setMessages([]);
    try {
      const { data } = await messagesAPI.getMessages(thread.id, 1, 50);
      setMessages(data.messages || []);
      // Отмечаем как прочитанные
      (data.messages || []).forEach(msg => {
        if (!msg.isRead && msg.senderId !== user?.id) {
          messagesAPI.markAsRead(thread.id, msg.id).catch(() => {});
        }
      });
      loadThreads();
    } catch (e) {
      toast.error('Ошибка загрузки сообщений');
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    try {
      const { data } = await messagesAPI.sendMessage(activeThread.id, newMessage.trim());
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      loadThreads();
    } catch (e) {
      toast.error('Ошибка отправки');
    } finally {
      setSending(false);
    }
  };

  // Открыть выбор предприятия
  const openEnterprisePicker = async () => {
    setShowEnterprisePicker(true);
    setSearchTerm('');
    setEnterprisesLoading(true);
    try {
      const { data } = await enterprisesAPI.getAll();
      setEnterprises(data.enterprises || data || []);
    } catch (e) {
      toast.error('Ошибка загрузки списка предприятий');
    } finally {
      setEnterprisesLoading(false);
    }
  };

  // Создание треда с выбранным предприятием
  const handleSelectEnterprise = async (enterpriseId) => {
    setShowEnterprisePicker(false);
    try {
      const { data } = await messagesAPI.createThread(enterpriseId);
      toast.success('Чат создан');
      // Обновляем список тредов
      const { data: threadsData } = await messagesAPI.getThreads();
      const updatedThreads = threadsData.threads || [];
      setThreads(updatedThreads);
      // Находим созданный тред и открываем его
      const newThread = updatedThreads.find(t => t.enterpriseId === enterpriseId || t.id === data.id);
      if (newThread) {
        openThread(newThread);
      }
    } catch (e) {
      toast.error('Ошибка создания чата');
    }
  };

  const filteredEnterprises = Array.isArray(enterprises)
    ? enterprises.filter(e =>
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Скролл к последнему сообщению только при добавлении нового
  useEffect(() => {
    if (messages.length > 0) {
      const messagesList = document.querySelector('.messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
      }
    }
  }, [messages.length]);

  return (
    <div className="messages-page">
      {/* Sidebar — список тредов */}
      <div className="messages-sidebar">
        <div className="messages-sidebar-header">
          <h3>Чаты</h3>
          {!isHR && (
            <button className="btn btn-sm btn-primary" onClick={openEnterprisePicker}>
              + Новый чат
            </button>
          )}
        </div>
        <div className="messages-threads-list">
          {loading && <p className="text-gray-500 p-4">Загрузка...</p>}
          {!loading && threads.length === 0 && (
            <p className="text-gray-500 p-4">Нет чатов</p>
          )}
          {threads.map(thread => (
            <div
              key={thread.id}
              className={`thread-item ${activeThread?.id === thread.id ? 'thread-item-active' : ''}`}
              onClick={() => openThread(thread)}
            >
              <div className="thread-item-header">
                <span className="thread-item-name">
                  {isHR ? thread.user?.email || 'Пользователь' : thread.enterprise?.name || 'Предприятие'}
                </span>
                {thread.unreadCount > 0 && (
                  <span className="thread-unread-badge">{thread.unreadCount}</span>
                )}
              </div>
              {thread.lastMessage && (
                <p className="thread-item-preview">
                  {thread.lastMessage.content.substring(0, 60)}...
                </p>
              )}
              {thread.vacancy?.title && (
                <p className="thread-item-vacancy">Вакансия: {thread.vacancy.title}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main — чат */}
      <div className="messages-main">
        {!activeThread ? (
          <div className="messages-placeholder">
            <p>Выберите чат для начала общения</p>
          </div>
        ) : (
          <>
            <div className="messages-chat-header">
              <h4>
                {isHR
                  ? activeThread.user?.email || 'Пользователь'
                  : activeThread.enterprise?.name || 'Предприятие'}
              </h4>
              {activeThread.vacancy?.title && (
                <span className="text-sm text-gray-500">Вакансия: {activeThread.vacancy.title}</span>
              )}
            </div>

            <div className="messages-list">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`message-bubble ${msg.senderId === user?.id ? 'message-mine' : 'message-theirs'}`}
                >
                  <p className="message-content">{msg.content}</p>
                  <p className="message-time">
                    {new Date(msg.createdAt).toLocaleString('ru-RU', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="messages-input-bar">
              <input
                type="text"
                className="form-control"
                placeholder="Напишите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={sending}
              />
              <button className="btn btn-primary" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                {sending ? '...' : '→'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модальное окно выбора предприятия */}
      {showEnterprisePicker && (
        <div className="modal-overlay" onClick={() => setShowEnterprisePicker(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Выберите предприятие</h3>
            <input
              type="text"
              className="form-control mb-4"
              placeholder="Поиск предприятия..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {enterprisesLoading ? (
                <p className="text-gray-500 text-center py-4">Загрузка...</p>
              ) : filteredEnterprises.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Предприятия не найдены</p>
              ) : (
                filteredEnterprises.map(ent => (
                  <button
                    key={ent.id}
                    className="test-account-btn mb-2"
                    onClick={() => handleSelectEnterprise(ent.id)}
                  >
                    <span className="test-account-role">{ent.name}</span>
                    <span className="test-account-email">{ent.city || ''}</span>
                  </button>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEnterprisePicker(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
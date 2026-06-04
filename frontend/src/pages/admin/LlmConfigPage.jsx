import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';
import toast from 'react-hot-toast';

export default function LlmConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    baseUrl: '',
    apiToken: '',
    modelName: '',
    systemPrompt: '',
  });
  const [testingId, setTestingId] = useState(null);

  useEffect(() => { loadConfigs(); }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getLlmConfigs();
      setConfigs(data);
    } catch (e) {
      toast.error('Ошибка загрузки конфигураций');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', baseUrl: '', apiToken: '', modelName: '', systemPrompt: '' });
    setShowModal(true);
  };

  const openEdit = (cfg) => {
    setEditingId(cfg.id);
    setForm({
      name: cfg.name,
      baseUrl: cfg.baseUrl,
      apiToken: '',
      modelName: cfg.modelName,
      systemPrompt: cfg.systemPrompt || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.apiToken) delete payload.apiToken;
        await adminAPI.updateLlmConfig(editingId, payload);
        toast.success('Конфигурация обновлена');
      } else {
        await adminAPI.createLlmConfig(form);
        toast.success('Конфигурация создана');
      }
      setShowModal(false);
      loadConfigs();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить конфигурацию?')) return;
    try {
      await adminAPI.deleteLlmConfig(id);
      toast.success('Конфигурация удалена');
      loadConfigs();
    } catch (e) {
      toast.error('Ошибка удаления');
    }
  };

  const handleActivate = async (id) => {
    try {
      await adminAPI.activateLlmConfig(id);
      toast.success('Конфигурация активирована');
      loadConfigs();
    } catch (e) {
      toast.error('Ошибка активации');
    }
  };

  const handleTest = async (id) => {
    setTestingId(id);
    try {
      const { data } = await adminAPI.testLlmConfig(id);
      if (data.success) {
        toast.success(`Тест OK: ${data.response?.substring(0, 100)}...`);
      } else {
        toast.error(`Ошибка: ${data.error}`);
      }
    } catch (e) {
      toast.error('Ошибка соединения');
    } finally {
      setTestingId(null);
    }
  };

  if (loading) return <div className="page-content"><p>Загрузка...</p></div>;

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>Настройка LLM</h2>
        <p>Управление конфигурациями языковых моделей для подбора вакансий</p>
      </div>

      <div className="mb-4">
        <button className="btn btn-primary" onClick={openCreate}>
          + Добавить конфигурацию
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Base URL</th>
              <th>Модель</th>
              <th>Активна</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((cfg) => (
              <tr key={cfg.id}>
                <td>{cfg.name}</td>
                <td className="text-sm text-gray-500">{cfg.baseUrl}</td>
                <td>{cfg.modelName}</td>
                <td>
                  <span className={`badge ${cfg.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {cfg.isActive ? 'Да' : 'Нет'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEdit(cfg)}
                    >
                      Редактировать
                    </button>
                    {!cfg.isActive && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleActivate(cfg.id)}
                      >
                        Активировать
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleTest(cfg.id)}
                      disabled={testingId === cfg.id}
                    >
                      {testingId === cfg.id ? 'Тестируем...' : 'Тест'}
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(cfg.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Редактировать конфигурацию' : 'Новая конфигурация'}</h3>
            <div className="form-group">
              <label>Название</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Base URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://llm.api.cloud.yandex.net/foundationModels/v1"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>API Token</label>
              <input
                type="password"
                className="form-control"
                value={form.apiToken}
                onChange={(e) => setForm({ ...form, apiToken: e.target.value })}
                placeholder={editingId ? 'Оставьте пустым, чтобы не менять' : ''}
                required={!editingId}
              />
              {editingId && <small className="text-gray-500">Оставьте пустым, чтобы не менять</small>}
            </div>
            <div className="form-group">
              <label>Название модели</label>
              <input
                type="text"
                className="form-control"
                placeholder="yandexgpt-lite"
                value={form.modelName}
                onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Системный промпт</label>
              <textarea
                className="form-control"
                rows={6}
                value={form.systemPrompt}
                onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Отмена
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingId ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const STATUS_LABELS = {
  draft: 'Черновик',
  pending: 'На модерации',
  approved: 'Одобрено',
  rejected: 'Отклонено',
};

export default function ModerationPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchEnterprises();
  }, []);

  const fetchEnterprises = async () => {
    try {
      const { data } = await api.get('/admin/enterprises/moderation');
      setEnterprises(data.enterprises || []);
    } catch (err) {
      toast.error('Ошибка загрузки предприятий');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, moderationStatus) => {
    try {
      await api.patch(`/admin/enterprises/${id}/moderate`, { moderationStatus });
      toast.success(`Предприятие ${moderationStatus === 'approved' ? 'одобрено' : 'отклонено'}`);
      setEnterprises((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      toast.error('Ошибка модерации');
    }
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Модерация предприятий</h3>

      {enterprises.length === 0 ? (
        <p className="text-gray-500">Нет предприятий на модерацию</p>
      ) : (
        <div className="space-y-4">
          {enterprises.map((e) => (
            <div key={e.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-lg">{e.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      e.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      e.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {STATUS_LABELS[e.moderationStatus]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{e.city}, {e.industry}</p>
                </div>
                <button
                  className="text-blue-600 text-sm hover:underline"
                  onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                >
                  {expandedId === e.id ? 'Скрыть' : 'Подробнее'}
                </button>
              </div>

              {expandedId === e.id && (
                <div className="mt-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="font-medium">Описание:</span>
                      <p className="text-gray-600 mt-1">{e.description || '—'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Условия труда:</span>
                      <p className="text-gray-600 mt-1">{e.laborConditions || '—'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Адрес:</span>
                      <p className="text-gray-600 mt-1">{e.address || '—'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Slug:</span>
                      <p className="text-gray-600 mt-1">{e.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                      onClick={() => handleModerate(e.id, 'approved')}
                    >
                      ✓ Одобрить
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      onClick={() => handleModerate(e.id, 'rejected')}
                    >
                      ✗ Отклонить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
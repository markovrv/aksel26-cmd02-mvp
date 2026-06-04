import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiUser, FiUserPlus, FiUserX } from 'react-icons/fi';

export default function HrManagementPage() {
  const [hrUsers, setHrUsers] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/admin/hr');
      setHrUsers(data.hrUsers || []);
      setEnterprises(data.enterprises || []);
    } catch (err) {
      toast.error('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId, enterpriseId) => {
    if (!enterpriseId) {
      toast.error('Выберите предприятие');
      return;
    }
    try {
      await api.post('/admin/hr/assign', { userId, enterpriseId });
      toast.success('HR назначен');
      fetchData();
    } catch (err) {
      toast.error('Ошибка назначения');
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm('Снять HR с должности и сделать соискателем?')) return;
    try {
      await api.delete(`/admin/hr/${userId}`);
      toast.success('HR снят с должности');
      fetchData();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  const filteredHrUsers = hrUsers.filter((u) =>
    (u.UserProfile?.fullName || u.email).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div>
      <h3 className="text-xl font-bold mb-6">Управление HR</h3>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск HR..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm">Email</th>
              <th className="text-left p-3 text-sm">Имя</th>
              <th className="text-left p-3 text-sm">Текущее предприятие</th>
              <th className="text-left p-3 text-sm">Назначить на предприятие</th>
              <th className="text-left p-3 text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredHrUsers.length === 0 && (
              <tr><td colSpan={5} className="text-center p-6 text-gray-400">HR-пользователи не найдены</td></tr>
            )}
            {filteredHrUsers.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm">{u.email}</td>
                <td className="p-3 text-sm">{u.UserProfile?.fullName || '—'}</td>
                <td className="p-3 text-sm">
                  {u.Enterprise ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {u.Enterprise.name}
                    </span>
                  ) : (
                    <span className="text-gray-400">Не назначен</span>
                  )}
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssign(u.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="" disabled>Выбрать предприятие...</option>
                      {enterprises.map((e) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  {u.enterpriseId ? (
                    <button
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      onClick={() => handleRemove(u.id)}
                    >
                      <FiUserX /> Снять
                    </button>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
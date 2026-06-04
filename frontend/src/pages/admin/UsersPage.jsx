import { useState, useEffect } from 'react';
import api, { profileAPI } from '../../services/api';

const ROLE_LABELS = {
  seeker: 'Соискатель',
  student: 'Студент',
  enterprise_user: 'HR предприятия',
  superadmin: 'Администратор',
};

const STATUS_LABELS = {
  active: 'Активен',
  pending: 'Ожидает',
  blocked: 'Заблокирован',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert('Ошибка обновления статуса');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole, enterpriseId: newRole !== 'enterprise_user' ? null : u.enterpriseId } : u))
      );
    } catch (err) {
      alert('Ошибка смены роли');
    }
  };

  const filteredUsers = filter === 'all' ? users : users.filter((u) => u.status === filter);

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Пользователи</h3>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'blocked'].map((f) => (
            <button
              key={f}
              className={`px-3 py-1 rounded text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Все' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm">Email</th>
              <th className="text-left p-3 text-sm">Имя</th>
              <th className="text-left p-3 text-sm">Роль</th>
              <th className="text-left p-3 text-sm">Статус</th>
              <th className="text-left p-3 text-sm">Дата регистрации</th>
              <th className="text-left p-3 text-sm">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 text-sm">{u.email}</td>
                <td className="p-3 text-sm">{u.UserProfile?.fullName || '—'}</td>
                <td className="p-3 text-sm">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {Object.entries(ROLE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' :
                    u.status === 'blocked' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {STATUS_LABELS[u.status]}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3 text-sm">
                  <select
                    value={u.status}
                    onChange={(e) => handleStatusChange(u.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="active">Активировать</option>
                    <option value="blocked">Заблокировать</option>
                    <option value="pending">На рассмотрении</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
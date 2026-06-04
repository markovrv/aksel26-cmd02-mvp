import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FiBriefcase, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi';

export default function MyApplicationsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отклик?')) return;
    setDeletingId(id);
    try {
      await applicationsAPI.delete(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error('Error deleting application:', error);
      alert(error.response?.data?.error || 'Ошибка при удалении отклика');
    } finally {
      setDeletingId(null);
    }
  };

  const fetchApplications = useCallback(async () => {
    try {
      const { data } = await applicationsAPI.getMyApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchApplications();
  }, [isAuthenticated, navigate, fetchApplications]);

  const getStatusBadge = (status) => {
    const badges = {
      new: { class: 'bg-blue-100 text-blue-700', icon: FiClock, label: 'Новая' },
      viewed: { class: 'bg-yellow-100 text-yellow-700', icon: FiClock, label: 'Просмотрено' },
      invited: { class: 'bg-green-100 text-green-700', icon: FiCheckCircle, label: 'Приглашение' },
      rejected: { class: 'bg-red-100 text-red-700', icon: FiXCircle, label: 'Отклонено' },
      hired: { class: 'bg-green-100 text-green-700', icon: FiCheckCircle, label: 'Принят' },
    };
    return badges[status] || badges.new;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Мои отклики</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center">
            <div className="p-8">
              <p className="text-gray-600 mb-4">Вы пока не откликнулись ни на одну вакансию</p>
              <button
                onClick={() => navigate('/vacancies')}
                className="btn-primary"
              >
                Найти вакансии
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const badge = getStatusBadge(app.status);
              const StatusIcon = badge.icon;

              return (
                <div key={app.id} className="card hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {app.Vacancy?.Enterprise?.name?.substring(0, 2) || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{app.Vacancy?.title}</h3>
                        <p className="text-accent">{app.Vacancy?.Enterprise?.name}</p>
                        <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <FiMapPin size={14} />
                            {app.Vacancy?.Enterprise?.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiBriefcase size={14} />
                            {app.Vacancy?.salaryFrom?.toLocaleString('ru-RU')} — {app.Vacancy?.salaryTo?.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${badge.class}`}>
                        <StatusIcon size={14} />
                        {badge.label}
                      </span>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>

                  {app.coverNote && (
                    <div className="mt-4 bg-light rounded">
                      <p className="text-sm text-gray-600 leading-relaxed p-4">
                        <strong>Сопроводительное письмо:</strong> {app.coverNote}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/vacancy/${app.Vacancy?.id}`)}
                      className="btn-secondary btn-sm"
                    >
                      Подробнее о вакансии
                    </button>
                    <button
                      onClick={() => navigate(`/enterprise/${app.Vacancy?.Enterprise?.slug}`)}
                      className="btn-secondary btn-sm"
                    >
                      О предприятии
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      disabled={deletingId === app.id}
                      className="btn btn-danger ml-auto"
                    >
                      <FiTrash2 size={14} />
                      {deletingId === app.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

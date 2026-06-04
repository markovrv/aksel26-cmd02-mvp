// src/pages/enterprise/EnterpriseDashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { FiBriefcase, FiFileText, FiCalendar, FiSettings } from 'react-icons/fi';
import { FiUsers } from 'react-icons/fi';

export default function EnterpriseDashboardPage() {
  const [stats, setStats] = useState({ vacanciesCount: 0, applicationsCount: 0, toursCount: 0, conversionFunnel: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await enterpriseAPI.getDashboard();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Нормализация данных — если API вернул массив, а не свой объект
  const funnel = stats.conversionFunnel || {};
  const hasFunnel = funnel.toursTotal !== undefined;

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  const cards = [
    { to: '/enterprise/profile', icon: <FiSettings />, title: 'Профиль предприятия', desc: 'Редактировать описание, условия труда' },
    { to: '/enterprise/my-profile', icon: <FiSettings />, title: 'Мой профиль', desc: 'Редактировать ФИО, телефон, город' },
    { to: '/enterprise/vacancies', icon: <FiBriefcase />, title: 'Вакансии', desc: 'Управление вакансиями' },
    { to: '/enterprise/applications', icon: <FiFileText />, title: 'Отклики', desc: 'Просмотр и обработка откликов' },
    { to: '/enterprise/tours', icon: <FiCalendar />, title: 'Экскурсии', desc: 'Организация экскурсий' },
    { to: '/enterprise/tour-bookings', icon: <FiUsers />, title: 'Бронирования экскурсий', desc: 'Просмотр и управление записями' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Панель предприятия</h1>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Вакансий</p>
            <p className="text-3xl font-bold text-blue-600">{stats.vacanciesCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Откликов</p>
            <p className="text-3xl font-bold text-green-600">{stats.applicationsCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-sm">Экскурсий</p>
            <p className="text-3xl font-bold text-purple-600">{stats.toursCount}</p>
          </div>
        </div>

        <div style={{ height: '48px' }}></div>

        {/* Воронка конверсии */}
        {hasFunnel && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Воронка конверсии</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-blue-500">
                <p className="text-2xl font-bold text-blue-600">{funnel.toursTotal}</p>
                <p className="text-xs text-gray-500 mt-1">Всего записей на экскурсии</p>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-2xl">→</div>
              <div className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-green-500">
                <p className="text-2xl font-bold text-green-600">{funnel.toursVisited}</p>
                <p className="text-xs text-gray-500 mt-1">Посетили экскурсию</p>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-2xl">→</div>
              <div className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-yellow-500">
                <p className="text-2xl font-bold text-yellow-600">{funnel.applicationsAfterTour}</p>
                <p className="text-xs text-gray-500 mt-1">Откликнулись после тура</p>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-2xl">→</div>
              <div className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-red-500">
                <p className="text-2xl font-bold text-red-600">{funnel.hired}</p>
                <p className="text-xs text-gray-500 mt-1">Нанято</p>
              </div>
              <div className="flex items-center justify-center text-gray-400 text-2xl">→</div>
              <div className="bg-white rounded-lg shadow p-4 text-center border-t-4 border-purple-500 col-span-1 md:col-span-1">
                <p className="text-2xl font-bold text-purple-600">{funnel.conversionRate}</p>
                <p className="text-xs text-gray-500 mt-1">Конверсия (нанято / посетили)</p>
              </div>
            </div>
          </div>
        )}

        {/* Навигационные карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition transform hover:-translate-y-1"
            >
              <div className="text-3xl text-blue-600 mb-4">{card.icon}</div>
              <h3 className="font-bold text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
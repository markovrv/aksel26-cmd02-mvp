// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { FiEdit, FiTrendingUp, FiTarget, FiClipboard, FiCalendar, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { applicationsAPI, toursAPI } from '../services/api';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { recommendations, getRecommendations, sessionId } = useAssessmentStore();
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(null);
  const [tourBookingsCount, setTourBookingsCount] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    // Загружаем отклики
    const fetchApplications = async () => {
      try {
        const { data } = await applicationsAPI.getMyApplications();
        setApplicationsCount(data.count);
      } catch (err) {
        console.error('Failed to load applications:', err);
        setApplicationsCount(0);
      }
    };

    // Загружаем бронирования экскурсий
    const fetchTourBookings = async () => {
      try {
        const { data } = await toursAPI.getMyBookings();
        setTourBookingsCount(data.count);
      } catch (err) {
        console.error('Failed to load tour bookings:', err);
        setTourBookingsCount(0);
      }
    };

    fetchApplications();
    fetchTourBookings();

    // Если есть активная сессия, но рекомендации ещё не загружены – подгружаем
    if (sessionId && (!recommendations || recommendations.length === 0)) {
      getRecommendations();
    }
  }, [isAuthenticated, navigate, sessionId, getRecommendations]);

  if (!isAuthenticated) {
    return null;
  }

  const recommendationsCount = recommendations?.length || 0;

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-12">Личный кабинет</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Profile Card */}
          <Link
            to="/dashboard/profile"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiEdit />
            </div>
            <h3 className="font-bold mb-2">Мой профиль</h3>
            <p className="text-sm text-gray-600">Отредактировать данные</p>
          </Link>

          {/* My Recommendations Card */}
          <Link
            to="/dashboard/recommendations"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiTrendingUp />
            </div>
            <h3 className="font-bold mb-2">Мои рекомендации</h3>
            <p className="text-sm text-gray-600">Список подобранных вакансий</p>
          </Link>

          {/* Assessment Card */}
          <Link
            to="/dashboard/assessment"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiTarget />
            </div>
            <h3 className="font-bold mb-2">Пройти анкету</h3>
            <p className="text-sm text-gray-600">Получить рекомендации</p>
          </Link>

          {/* My Applications Card */}
          <Link
            to="/dashboard/applications"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiClipboard />
            </div>
            <h3 className="font-bold mb-2">Мои отклики</h3>
            <p className="text-sm text-gray-600">Отклики на вакансии</p>
          </Link>

          {/* My Tour Bookings Card */}
          <Link
            to="/dashboard/tour-bookings"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiCalendar />
            </div>
            <h3 className="font-bold mb-2">Мои записи на экскурсии</h3>
            <p className="text-sm text-gray-600">Запланированные экскурсии</p>
          </Link>

          {/* Messages Card */}
          <Link
            to="/messages"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiMessageSquare />
            </div>
            <h3 className="font-bold mb-2">Сообщения</h3>
            <p className="text-sm text-gray-600">Чаты с предприятиями</p>
          </Link>

          {/* Digital Passport Card */}
          <Link
            to="/dashboard/digital-passport"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiFileText />
            </div>
            <h3 className="font-bold mb-2">Цифровой паспорт</h3>
            <p className="text-sm text-gray-600">Сводка профиля, скачать PDF</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h4 className="text-sm text-gray-600 mb-2">Мои отклики</h4>
            <p className="text-3xl font-bold text-accent">
              {applicationsCount !== null ? applicationsCount : '...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">на вакансии</p>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h4 className="text-sm text-gray-600 mb-2">Записи на экскурсии</h4>
            <p className="text-3xl font-bold text-success">
              {tourBookingsCount !== null ? tourBookingsCount : '...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">запланировано</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <h4 className="text-sm text-gray-600 mb-2">Рекомендации</h4>
            <p className="text-3xl font-bold">{recommendationsCount}</p>
            <p className="text-xs text-gray-500 mt-2">предприятий и вакансий</p>
          </div>
        </div>
      </div>
    </div>
  );
}
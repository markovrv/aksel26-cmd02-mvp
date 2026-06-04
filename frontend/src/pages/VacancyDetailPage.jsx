// src/pages/VacancyDetailPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { vacanciesAPI, applicationsAPI, toursAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiSend,
  FiUsers,
} from 'react-icons/fi';

export default function VacancyDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverNote, setCoverNote] = useState('');

  // Состояния для экскурсий предприятия
  const [enterpriseTours, setEnterpriseTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(false);

  // Состояния для бронирования экскурсии (как в ToursPage)
  const [bookingTourId, setBookingTourId] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const fetchVacancy = useCallback(async () => {
    try {
      const { data } = await vacanciesAPI.getById(id);
      setVacancy(data);
    } catch (error) {
      console.error('Error fetching vacancy:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVacancy();
  }, [fetchVacancy]);

  // Загрузка экскурсий предприятия после получения вакансии
  const fetchEnterpriseTours = useCallback(async () => {
    if (!vacancy?.Enterprise?.id) return;
    setToursLoading(true);
    try {
      const { data } = await toursAPI.getAll({ enterpriseId: vacancy.Enterprise.id });
      setEnterpriseTours(data.tours || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setToursLoading(false);
    }
  }, [vacancy]);

  useEffect(() => {
    fetchEnterpriseTours();
  }, [fetchEnterpriseTours]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.create(
        vacancy.id,
        vacancy.employmentType === 'practice' ? 'practice_application' : 'job_application',
        coverNote
      );
      setApplied(true);
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при отклике');
    } finally {
      setApplying(false);
    }
  };

  const handleBookTour = async (tourId) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите для записи на экскурсию');
      return;
    }

    setBookingTourId(tourId);
    try {
      await toursAPI.book(tourId);
      setBookingSuccess(tourId);
      // Обновляем данные экскурсий, чтобы отобразилось актуальное количество мест
      await fetchEnterpriseTours();
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при записи на экскурсию');
    } finally {
      setBookingTourId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Вакансия не найдена</p>
      </div>
    );
  }

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Полная занятость',
      internship: 'Стажировка',
      practice: 'Практика',
      shift: 'Вахта',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link to="/vacancies" className="text-accent hover:underline">
            ← Каталог вакансий
          </Link>
        </nav>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {vacancy.Enterprise?.name?.substring(0, 2) || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{vacancy.title}</h1>
                  <Link
                    to={`/enterprise/${vacancy.Enterprise?.slug}`}
                    className="text-accent font-medium hover:underline"
                  >
                    {vacancy.Enterprise?.name}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <FiMapPin size={16} />
                  {vacancy.Enterprise?.city}, {vacancy.Enterprise?.address}
                </span>
                <span className="flex items-center gap-1">
                  <FiDollarSign size={16} />
                  {vacancy.salaryFrom?.toLocaleString('ru-RU')} — {vacancy.salaryTo?.toLocaleString('ru-RU')} ₽
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar size={16} />
                  {vacancy.schedule}
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {getEmploymentTypeLabel(vacancy.employmentType)}
                </span>
                {vacancy.isStudentAvailable && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    Для студентов
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
              <h2 className="text-xl font-bold mb-4">Описание вакансии</h2>
              <div className="prose max-w-none">
                <h3 className="font-bold">Обязанности</h3>
                <p className="text-gray-700 mb-4">{vacancy.responsibilities}</p>

                <h3 className="font-bold">Требования</h3>
                <p className="text-gray-700 mb-4">{vacancy.requirements}</p>

                <h3 className="font-bold">Условия</h3>
                <p className="text-gray-700 mb-4">{vacancy.benefits}</p>

                {vacancy.medicalRequirements && (
                  <>
                    <h3 className="font-bold">Медицинские требования</h3>
                    <p className="text-gray-700 mb-4">{vacancy.medicalRequirements}</p>
                  </>
                )}
              </div>
            </div>

            {/* Enterprise Info */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold mb-4">О предприятии</h2>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {vacancy.Enterprise?.name?.substring(0, 2) || '?'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold">{vacancy.Enterprise?.name}</h3>
                  <p className="text-gray-600 text-sm">{vacancy.Enterprise?.industry}</p>
                  <p className="text-gray-600 text-sm mt-1">{vacancy.Enterprise?.description}</p>
                </div>
              </div>
              <Link
                to={`/enterprise/${vacancy.Enterprise?.slug}`}
                className="btn btn-secondary"
              >
                Подробнее о предприятии
              </Link>
            </div>

            {/* Enterprise Tours */}
            {vacancy.Enterprise?.id && (
              <div className="mt-6">
                {toursLoading ? (
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                    Загрузка экскурсий...
                  </div>
                ) : enterpriseTours.length > 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-xl font-bold mb-4">Экскурсии на предприятии</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {enterpriseTours.map((tour) => (
                        <div
                          key={tour.id}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">{tour.title}</h3>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                tour.format === 'online'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {tour.format === 'online' ? 'Онлайн' : 'Офлайн'}
                            </span>
                          </div>
                          {tour.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {tour.description.length > 100
                                ? tour.description.substring(0, 100) + '...'
                                : tour.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <FiCalendar size={14} />
                              {new Date(tour.startAt).toLocaleDateString('ru-RU')}
                            </span>
                            {tour.format === 'offline' && (
                              <span className="flex items-center gap-1">
                                <FiMapPin size={14} />
                                {vacancy.Enterprise?.city}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FiUsers size={14} />
                              {tour.capacity - (tour.TourBookings?.length || 0)} мест
                            </span>
                          </div>

                          {/* Кнопка записи – полностью как в ToursPage */}
                          {bookingSuccess === tour.id ? (
                            <button
                              disabled
                              className="w-full btn bg-green-500 text-white flex items-center justify-center gap-2 py-2"
                            >
                              <FiCheckCircle size={16} />
                              Вы записаны!
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBookTour(tour.id)}
                              disabled={bookingTourId === tour.id}
                              className="w-full btn-primary py-2"
                            >
                              {bookingTourId === tour.id ? 'Запись...' : 'Записаться'}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-1">
            {/* Apply Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Откликнуться</h3>

              {applied ? (
                <div className="text-center py-8">
                  <div className="text-success text-5xl mb-4">
                    <FiCheckCircle className="mx-auto" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Отклик отправлен!</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    HR-специалист свяжется с вами в ближайшее время
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/applications')}
                    className="btn-primary w-full"
                  >
                    Мои отклики
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      Сопроводительное письмо (необязательно)
                    </label>
                    <textarea
                      className="input min-h-32"
                      placeholder="Расскажите о себе..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full btn-primary flex items-center justify-center gap-2"
                  >
                    <FiSend />
                    {applying ? 'Отправка...' : 'Откликнуться'}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Войдите или зарегистрируйтесь для отклика
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
              <h4 className="font-bold mb-4">Информация о вакансии</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Отдел</span>
                  <span className="font-medium">{vacancy.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">График</span>
                  <span className="font-medium">{vacancy.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Тип занятости</span>
                  <span className="font-medium">{getEmploymentTypeLabel(vacancy.employmentType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Опубликовано</span>
                  <span className="font-medium">
                    {new Date(vacancy.publishedAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
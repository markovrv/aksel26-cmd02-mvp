import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toursAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FiCalendar, FiMapPin, FiUsers, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function ToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [bookingTourId, setBookingTourId] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const { isAuthenticated } = useAuthStore();

  const fetchTours = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter ? { format: filter } : {};
      const { data } = await toursAPI.getAll(params);
      setTours(data.tours || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleBookTour = async (tourId) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите для записи на экскурсию');
      return;
    }

    setBookingTourId(tourId);
    try {
      await toursAPI.book(tourId);
      setBookingSuccess(tourId);
      // Обновляем данные туров, чтобы отобразилось актуальное количество мест
      await fetchTours();
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при записи на экскурсию');
    } finally {
      setBookingTourId(null);
    }
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Экскурсии на предприятия</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Формат:</span>
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded ${
                filter === '' ? 'bg-accent text-white' : 'bg-light text-primary hover:bg-gray-200'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('offline')}
              className={`px-4 py-2 rounded ${
                filter === 'offline' ? 'bg-accent text-white' : 'bg-light text-primary hover:bg-gray-200'
              }`}
            >
              Офлайн
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-4 py-2 rounded ${
                filter === 'online' ? 'bg-accent text-white' : 'bg-light text-primary hover:bg-gray-200'
              }`}
            >
              Онлайн
            </button>
          </div>
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Экскурсии не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tours.map((tour) => (
              <div key={tour.id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{tour.title}</h3>
                    <Link
                      to={`/enterprise/${tour.Enterprise?.slug}`}
                      className="text-accent text-sm hover:underline"
                    >
                      {tour.Enterprise?.name}
                    </Link>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded ${
                    tour.format === 'online'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {tour.format === 'online' ? 'Онлайн' : 'Офлайн'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{tour.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} />
                    <span>{new Date(tour.startAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock size={14} />
                    <span>
                      {new Date(tour.startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {tour.format === 'offline' && (
                    <div className="flex items-center gap-2">
                      <FiMapPin size={14} />
                      <span>{tour.Enterprise?.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FiUsers size={14} />
                    <span>
                      Осталось: {tour.capacity - (tour.TourBookings?.length || 0)} из {tour.capacity}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {bookingSuccess === tour.id ? (
                    <button
                      disabled
                      className="flex-1 btn bg-green-500 text-white flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle />
                      Вы записаны!
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBookTour(tour.id)}
                      disabled={bookingTourId === tour.id}
                      className="flex-1 btn-primary"
                    >
                      {bookingTourId === tour.id ? 'Запись...' : 'Записаться'}
                    </button>
                  )}
                  <Link
                    to={`/enterprise/${tour.Enterprise?.slug}`}
                    className="btn btn-secondary"
                  >
                    О предприятии
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  FiCalendar,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiTrash2,
} from 'react-icons/fi';

export default function MyTourBookingsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // id отменяемой записи

  const fetchBookings = useCallback(async () => {
    try {
      const { data } = await toursAPI.getMyBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated, navigate, fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Вы уверены, что хотите отменить запись на экскурсию?')) return;

    setCancellingId(bookingId);
    try {
      await toursAPI.cancelBooking(bookingId);
      // Обновляем список бронирований
      await fetchBookings();
      alert('Запись на экскурсию отменена');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Не удалось отменить запись. Попробуйте позже.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { class: 'bg-blue-100 text-blue-700', icon: FiCalendar, label: 'Новая заявка' },
      confirmed: {
        class: 'bg-green-100 text-green-700',
        icon: FiCheckCircle,
        label: 'Подтверждена',
      },
      cancelled: {
        class: 'bg-red-100 text-red-700',
        icon: FiXCircle,
        label: 'Отменена',
      },
      visited: {
        class: 'bg-gray-100 text-gray-700',
        icon: FiCheckCircle,
        label: 'Посещена',
      },
    };
    return badges[status] || badges.new;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Мои экскурсии</h1>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm text-center">
            <div className="p-8">
              <p className="text-gray-600 mb-4">
                Вы пока не записались ни на одну экскурсию
              </p>
              <button onClick={() => navigate('/tours')} className="btn-primary">
                Найти экскурсии
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const badge = getStatusBadge(booking.status);
              const StatusIcon = badge.icon;
              const tour = booking.Tour;
              const canCancel =
                booking.status === 'new' || booking.status === 'confirmed';

              return (
                <div key={booking.id} className="card hover:shadow-lg transition">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          tour?.format === 'online'
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                            : 'bg-gradient-to-br from-green-400 to-green-600'
                        }`}
                      >
                        <span className="text-white text-xl font-bold">
                          {tour?.format === 'online' ? '📱' : '🏭'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{tour?.title}</h3>
                        <p className="text-accent">{tour?.Enterprise?.name}</p>
                        <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            {new Date(tour?.startAt).toLocaleDateString('ru-RU')} в{' '}
                            {new Date(tour?.startAt).toLocaleTimeString('ru-RU', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {tour?.format === 'offline' && (
                            <span className="flex items-center gap-1">
                              <FiMapPin size={14} />
                              {tour?.Enterprise?.city}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${badge.class}`}
                      >
                        <StatusIcon size={14} />
                        {badge.label}
                      </span>
                      <p className="text-sm text-gray-500">
                        Записался: {new Date(booking.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                      {canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="btn-danger btn-sm flex items-center gap-1"
                        >
                          <FiTrash2 size={14} />
                          {cancellingId === booking.id ? 'Отмена...' : 'Отменить запись'}
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.comment && (
                    <div className="mt-4 bg-light rounded">
                      <p className="text-sm text-gray-600 leading-relaxed p-4">
                        <strong>Комментарий:</strong> {booking.comment}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button
                      onClick={() => navigate(`/enterprise/${tour?.Enterprise?.slug}`)}
                      className="btn-secondary btn-sm flex items-center gap-1"
                    >
                      <FiExternalLink size={14} />О предприятии
                    </button>
                    {tour?.format === 'online' && booking.status === 'confirmed' && (
                      <button className="btn-primary btn-sm">
                        Присоединиться к онлайн-экскурсии
                      </button>
                    )}
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
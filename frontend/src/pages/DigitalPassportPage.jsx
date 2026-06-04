import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { profileAPI, applicationsAPI, toursAPI, recommendationsAPI } from '../services/api';
import { FiUser, FiMapPin, FiPhone, FiMail, FiDownload, FiStar, FiBriefcase, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DigitalPassportPage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const passportRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    loadAllData();
  }, [isAuthenticated, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [profileRes, appsRes, bookingsRes] = await Promise.allSettled([
        profileAPI.getProfile(),
        applicationsAPI.getMyApplications(),
        toursAPI.getMyBookings(),
      ]);

      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data?.user?.Profile || profileRes.value.data?.profile || {});
      if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data?.applications || []);
      if (bookingsRes.status === 'fulfilled') setBookings(bookingsRes.value.data?.bookings || []);

      try {
        const sessId = localStorage.getItem('assessment_sessionId');
        if (sessId) {
          const recRes = await recommendationsAPI.getRecommendations(sessId);
          setRecommendations((recRes.data?.recommendations || []).slice(0, 3));
        }
      } catch (e) {}
    } catch (e) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!passportRef.current) return;
    setGeneratingPdf(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0.5,
        filename: 'passport.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };
      await html2pdf().set(opt).from(passportRef.current).save();
      toast.success('PDF сохранён');
    } catch (e) {
      toast.error('Ошибка генерации PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const statusBadge = (status) => {
    const colors = {
      new: 'badge-info', viewed: 'badge-primary', invited: 'badge-success',
      rejected: 'badge-secondary', hired: 'badge-success',
      confirmed: 'badge-success', cancelled: 'badge-secondary', visited: 'badge-success',
    };
    const labels = {
      new: 'Новый', viewed: 'Просмотрено', invited: 'Приглашён',
      rejected: 'Отклонён', hired: 'Нанят',
      confirmed: 'Подтверждено', cancelled: 'Отменено', visited: 'Посещено',
    };
    return <span className={`badge ${colors[status] || 'badge-secondary'}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Загрузка паспорта...</p></div>;

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Цифровой паспорт соискателя</h1>
          <button className="btn btn-primary" onClick={handleDownloadPdf} disabled={generatingPdf}>
            <FiDownload size={16} />
            {generatingPdf ? 'Генерация...' : 'Скачать PDF'}
          </button>
        </div>

        <div ref={passportRef} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border">
          {/* Карточка профиля */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <FiUser size={32} />}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.fullName || 'Не указано'}</h2>
              <p className="text-gray-500">{profile?.desiredPosition || 'Желаемая должность не указана'}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {profile?.city && <span className="flex items-center gap-1"><FiMapPin size={14} /> {profile.city}</span>}
                {profile?.phone && <span className="flex items-center gap-1"><FiPhone size={14} /> {profile.phone}</span>}
                {user?.email && <span className="flex items-center gap-1"><FiMail size={14} /> {user.email}</span>}
              </div>
            </div>
          </div>

          {/* Результаты ассессмента */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FiStar /> Мои результаты ассессмента</h3>
            {recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm">Пройдите анкету, чтобы увидеть рекомендации</p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div key={rec.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{rec.Enterprise?.name || 'Предприятие'}</p>
                      <p className="text-sm text-gray-500">{rec.Vacancy?.title || 'Вакансия'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-accent">{rec.matchScore}%</span>
                      <p className="text-xs text-gray-400">совпадение</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Мои отклики */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FiBriefcase /> Мои отклики</h3>
            {applications.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет откликов на вакансии</p>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{app.Vacancy?.title || 'Вакансия'}</p>
                      <p className="text-xs text-gray-500">{new Date(app.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                    {statusBadge(app.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Мои экскурсии */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FiCalendar /> Мои экскурсии</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет бронирований экскурсий</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{b.Tour?.title || 'Экскурсия'}</p>
                      <p className="text-xs text-gray-500">{b.Tour?.startAt ? new Date(b.Tour.startAt).toLocaleDateString('ru-RU') : ''}</p>
                    </div>
                    {statusBadge(b.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Подвал */}
          <div className="text-center text-xs text-gray-400 pt-4 border-t">
            Сгенерировано на платформе "Вперёд по маршрутам" · {new Date().toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>
    </div>
  );
}
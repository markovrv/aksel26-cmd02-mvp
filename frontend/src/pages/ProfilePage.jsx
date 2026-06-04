import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { profileAPI } from '../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiBook, FiSave } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    age: '',
    desiredPosition: '',
    desiredSalaryFrom: '',
    desiredSalaryTo: '',
    preferredSchedule: '',
    relocationReady: false,
    experienceSummary: '',
    educationInfo: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await profileAPI.getProfile();
      const p = data.user?.Profile || data.profile || {};
      setForm({
        fullName: p.fullName || '',
        phone: p.phone || '',
        city: p.city || '',
        age: p.age || '',
        desiredPosition: p.desiredPosition || '',
        desiredSalaryFrom: p.desiredSalaryFrom || '',
        desiredSalaryTo: p.desiredSalaryTo || '',
        preferredSchedule: p.preferredSchedule || '',
        relocationReady: p.relocationReady || false,
        experienceSummary: p.experienceSummary || '',
        educationInfo: p.educationInfo || '',
      });
    } catch (err) {
      setError('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await profileAPI.updateProfile(form);
      setSuccess('Профиль успешно обновлён');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  const roleLabels = {
    seeker: 'Соискатель',
    student: 'Студент',
    enterprise_user: 'Представитель предприятия',
    superadmin: 'Администратор',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

        {/* User info card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
              {(form.fullName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{form.fullName || 'Без имени'}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiMail className="inline" /> {user?.email}
              </p>
              <p className="text-sm text-gray-500">
                Роль: <span className="font-semibold">{roleLabels[user?.role] || user?.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
            {success}
          </div>
        )}

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiUser /> Основная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="form-group">
              <label className="flex items-center gap-1"><FiUser className="text-gray-400" /> ФИО</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="form-control"
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><FiPhone className="text-gray-400" /> Телефон</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="+7 (900) 123-45-67"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> Город</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="form-control"
                placeholder="Екатеринбург"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><FiCalendar className="text-gray-400" /> Возраст</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="form-control"
                placeholder="28"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiBriefcase /> Профессиональная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="form-group">
              <label>Желаемая должность</label>
              <input
                type="text"
                name="desiredPosition"
                value={form.desiredPosition}
                onChange={handleChange}
                className="form-control"
                placeholder="Оператор станков с ЧПУ"
              />
            </div>

            <div className="form-group">
              <label>График работы</label>
              <select
                name="preferredSchedule"
                value={form.preferredSchedule}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Не выбран</option>
                <option value="Пятидневка">Пятидневка</option>
                <option value="Сменный график">Сменный график</option>
                <option value="Вахтовый метод">Вахтовый метод</option>
                <option value="Гибкий график">Гибкий график</option>
                <option value="Удаленная работа">Удаленная работа</option>
              </select>
            </div>

            <div className="form-group">
              <label>Зарплата от</label>
              <input
                type="number"
                name="desiredSalaryFrom"
                value={form.desiredSalaryFrom}
                onChange={handleChange}
                className="form-control"
                placeholder="70000"
              />
            </div>

            <div className="form-group">
              <label>Зарплата до</label>
              <input
                type="number"
                name="desiredSalaryTo"
                value={form.desiredSalaryTo}
                onChange={handleChange}
                className="form-control"
                placeholder="95000"
              />
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="relocationReady"
                checked={form.relocationReady}
                onChange={handleChange}
                className="w-4 h-4 accent-primary"
              />
              <span>Готов(а) к переезду</span>
            </label>
          </div>

          <div className="form-group mb-6">
            <label className="flex items-center gap-1"><FiBook className="text-gray-400" /> Опыт работы</label>
            <textarea
              name="experienceSummary"
              value={form.experienceSummary}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Опишите ваш опыт работы..."
            />
          </div>

          <div className="form-group mb-8">
            <label>Образование</label>
            <textarea
              name="educationInfo"
              value={form.educationInfo}
              onChange={handleChange}
              className="form-control"
              rows="2"
              placeholder="Ваше образование..."
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg flex items-center gap-2"
            disabled={saving}
          >
            <FiSave />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
}
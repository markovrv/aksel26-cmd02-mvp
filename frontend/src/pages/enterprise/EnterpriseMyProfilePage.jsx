// src/pages/enterprise/EnterpriseMyProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { profileAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiUser, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiBook } from 'react-icons/fi';

export default function EnterpriseMyProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.getProfile();
      // data приходит как { id, email, role, status, emailVerified, profile: {...} }
      const p = data.profile || data.user?.Profile || {};
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
      toast.error('Ошибка загрузки профиля');
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
    setSaving(true);
    try {
      await profileAPI.updateProfile(form);
      toast.success('Профиль успешно обновлён');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

      {/* User info card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {(form.fullName || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{form.fullName || 'Без имени'}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500">Представитель предприятия</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiUser /> Основная информация</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="flex items-center gap-1"><FiUser className="text-gray-400" /> ФИО</label>
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="form-control" placeholder="Иванов Иван" />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-1"><FiPhone className="text-gray-400" /> Телефон</label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="+7 (900) 123-45-67" />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> Город</label>
            <input type="text" name="city" value={form.city} onChange={handleChange} className="form-control" placeholder="Екатеринбург" />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-1"><FiCalendar className="text-gray-400" /> Возраст</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} className="form-control" placeholder="28" />
          </div>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center gap-2"><FiBriefcase /> Профессиональная информация</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label>Желаемая должность</label>
            <input type="text" name="desiredPosition" value={form.desiredPosition} onChange={handleChange} className="form-control" placeholder="Оператор станков с ЧПУ" />
          </div>
          <div className="form-group">
            <label>График работы</label>
            <select name="preferredSchedule" value={form.preferredSchedule} onChange={handleChange} className="form-control">
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
            <input type="number" name="desiredSalaryFrom" value={form.desiredSalaryFrom} onChange={handleChange} className="form-control" placeholder="70000" />
          </div>
          <div className="form-group">
            <label>Зарплата до</label>
            <input type="number" name="desiredSalaryTo" value={form.desiredSalaryTo} onChange={handleChange} className="form-control" placeholder="95000" />
          </div>
        </div>

        <div className="form-group">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="relocationReady" checked={form.relocationReady} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
            <span>Готов(а) к переезду</span>
          </label>
        </div>

        <div className="form-group">
          <label className="flex items-center gap-1"><FiBook className="text-gray-400" /> Опыт работы</label>
          <textarea name="experienceSummary" value={form.experienceSummary} onChange={handleChange} className="form-control" rows="3" placeholder="Опишите ваш опыт работы..." />
        </div>

        <div className="form-group">
          <label>Образование</label>
          <textarea name="educationInfo" value={form.educationInfo} onChange={handleChange} className="form-control" rows="2" placeholder="Ваше образование..." />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary btn-lg flex items-center gap-2 w-full justify-center">
          <FiSave /> {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}
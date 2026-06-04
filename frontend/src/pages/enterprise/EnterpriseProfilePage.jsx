// src/pages/enterprise/EnterpriseProfilePage.jsx
import { useEffect, useState } from 'react';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiUser, FiBriefcase, FiMapPin, FiPhone, FiMail, FiShield, FiAlertCircle } from 'react-icons/fi';

export default function EnterpriseProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    description: '',
    laborConditions: '',
    safetyInfo: '',
    address: '',
    city: '',
    region: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await enterpriseAPI.getProfile();
        setProfile({
          name: data.name || '',
          description: data.description || '',
          laborConditions: data.laborConditions || '',
          safetyInfo: data.safetyInfo || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          phone: data.phone || '',
          email: data.email || '',
        });
      } catch (err) {
        toast.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await enterpriseAPI.updateProfile(profile);
      toast.success('Профиль предприятия обновлён');
    } catch (err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
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
        <h1 className="text-3xl font-bold mb-8">Редактирование профиля предприятия</h1>

        {/* Enterprise info card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {(profile.name || 'П')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name || 'Без названия'}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FiMapPin className="inline" /> {[profile.city, profile.region].filter(Boolean).join(', ') || 'Город не указан'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiUser /> Основная информация
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="form-group">
              <label className="flex items-center gap-1"><FiUser className="text-gray-400" /> Название предприятия</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="form-control" placeholder="АО «Северный машзавод»" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> Город</label>
              <input type="text" name="city" value={profile.city} onChange={handleChange} className="form-control" placeholder="Екатеринбург" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> Регион</label>
              <input type="text" name="region" value={profile.region} onChange={handleChange} className="form-control" placeholder="Уральский федеральный округ" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiMapPin className="text-gray-400" /> Адрес</label>
              <input type="text" name="address" value={profile.address} onChange={handleChange} className="form-control" placeholder="ул. Промышленная, 1" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiPhone className="text-gray-400" /> Телефон</label>
              <input type="text" name="phone" value={profile.phone} onChange={handleChange} className="form-control" placeholder="+7 (343) 123-45-67" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiMail className="text-gray-400" /> Email</label>
              <input type="email" name="email" value={profile.email} onChange={handleChange} className="form-control" placeholder="info@example.com" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiBriefcase /> Условия работы
          </h3>

          <div className="space-y-4 mb-8">
            <div className="form-group">
              <label className="flex items-center gap-1"><FiAlertCircle className="text-gray-400" /> Описание предприятия</label>
              <textarea name="description" value={profile.description} onChange={handleChange} className="form-control" rows="4" placeholder="Краткое описание деятельности предприятия..." />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><FiShield className="text-gray-400" /> Условия труда</label>
              <textarea name="laborConditions" value={profile.laborConditions} onChange={handleChange} className="form-control" rows="3" placeholder="График работы, социальные гарантии, льготы..." />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-1"><FiShield className="text-gray-400" /> Информация о безопасности</label>
              <textarea name="safetyInfo" value={profile.safetyInfo} onChange={handleChange} className="form-control" rows="3" placeholder="Обучение, СИЗ, медосмотры..." />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg flex items-center gap-2" disabled={saving}>
            <FiSave /> {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { profileAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function ProfileTab() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    age: '',
    desiredPosition: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data } = await profileAPI.getProfile();
      const p = data.user?.Profile || data.profile || {};
      setProfile(p);
      setForm({
        fullName: p.fullName || '',
        phone: p.phone || '',
        city: p.city || '',
        age: p.age || '',
        desiredPosition: p.desiredPosition || '',
      });
    } catch (e) {
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(form);
      toast.success('Профиль обновлён');
    } catch (e) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="card">
      <h3 className="mb-4">Мой профиль</h3>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Email: <strong>{user?.email}</strong></p>
        <p className="text-sm text-gray-500">Роль: <strong>Администратор</strong></p>
      </div>

      <div className="form-group">
        <label>ФИО</label>
        <input type="text" className="form-control" value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Телефон</label>
        <input type="text" className="form-control" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Город</label>
        <input type="text" className="form-control" value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </div>
      <div className="form-group">
        <label>Возраст</label>
        <input type="number" className="form-control" value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })} />
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
    </div>
  );
}
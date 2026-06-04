// src/pages/enterprise/EnterpriseVacancyFormPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiUser, FiBriefcase, FiDollarSign, FiClock, FiCheckSquare, FiAlertTriangle, FiHeart, FiUsers } from 'react-icons/fi';

const DEFAULT_VACANCY = {
  title: '',
  department: '',
  employmentType: 'full_time',
  salaryFrom: '',
  salaryTo: '',
  schedule: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  medicalRequirements: '',
  isStudentAvailable: false,
  status: 'draft',
};

const EMPLOYMENT_LABELS = {
  full_time: 'Полная занятость',
  shift: 'Сменный график',
  practice: 'Практика',
  internship: 'Стажировка',
  remote: 'Удалённая',
};

export default function EnterpriseVacancyFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const [form, setForm] = useState(DEFAULT_VACANCY);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      (async () => {
        try {
          const { data } = await enterpriseAPI.getVacancies();
          const vac = data.vacancies?.find((v) => v.id === id);
          if (vac) setForm(vac);
        } catch (err) {
          toast.error('Не удалось загрузить вакансию');
        }
      })();
    }
  }, [isEditing, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await enterpriseAPI.updateVacancy(id, form);
        toast.success('Вакансия обновлена');
      } else {
        await enterpriseAPI.createVacancy(form);
        toast.success('Вакансия создана');
      }
      navigate('/enterprise/vacancies');
    } catch (err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка вакансии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">
          {isEditing ? 'Редактировать вакансию' : 'Новая вакансия'}
        </h1>

        {/* Info card */}
        <div className="card mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              <FiBriefcase size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{form.title || 'Новая вакансия'}</h2>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Редактирование существующей вакансии' : 'Создание новой вакансии'}
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
              <label className="flex items-center gap-1"><FiBriefcase className="text-gray-400" /> Название вакансии *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Оператор станков с ЧПУ" required />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiUser className="text-gray-400" /> Отдел</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} className="form-control" placeholder="Механообрабатывающий цех" />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiBriefcase className="text-gray-400" /> Тип занятости</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className="form-control">
                {Object.entries(EMPLOYMENT_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiClock className="text-gray-400" /> График работы</label>
              <input type="text" name="schedule" value={form.schedule} onChange={handleChange} className="form-control" placeholder="5/2, Сменный 2/2, Вахтовый 15/15" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiDollarSign /> Заработная плата
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="form-group">
              <label>Зарплата от</label>
              <input type="number" name="salaryFrom" value={form.salaryFrom} onChange={handleChange} className="form-control" placeholder="50000" />
            </div>
            <div className="form-group">
              <label>Зарплата до</label>
              <input type="number" name="salaryTo" value={form.salaryTo} onChange={handleChange} className="form-control" placeholder="80000" />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiCheckSquare /> Требования и обязанности
          </h3>

          <div className="space-y-4 mb-8">
            <div className="form-group">
              <label className="flex items-center gap-1"><FiAlertTriangle className="text-gray-400" /> Требования</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} className="form-control" rows={3} placeholder="Среднее профессиональное образование, опыт работы от 1 года..." />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiCheckSquare className="text-gray-400" /> Обязанности</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} className="form-control" rows={3} placeholder="Наладка и обслуживание станков с ЧПУ, изготовление деталей..." />
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FiHeart /> Условия и бонусы
          </h3>

          <div className="space-y-4 mb-8">
            <div className="form-group">
              <label className="flex items-center gap-1"><FiHeart className="text-gray-400" /> Бенефиты и условия</label>
              <textarea name="benefits" value={form.benefits} onChange={handleChange} className="form-control" rows={3} placeholder="Официальное трудоустройство, ДМС, обучение..." />
            </div>
            <div className="form-group">
              <label className="flex items-center gap-1"><FiUsers className="text-gray-400" /> Медицинские требования</label>
              <textarea name="medicalRequirements" value={form.medicalRequirements} onChange={handleChange} className="form-control" rows={2} placeholder="Отсутствие противопоказаний для работы на высоте..." />
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isStudentAvailable" checked={form.isStudentAvailable} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
              <span>Доступно для студентов</span>
            </label>
          </div>

          {isEditing && (
            <>
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FiBriefcase /> Статус
              </h3>
              <div className="form-group mb-8">
                <select name="status" value={form.status} onChange={handleChange} className="form-control">
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликована</option>
                  <option value="archived">Архив</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg flex items-center gap-2 w-full justify-center">
            <FiSave /> {loading ? 'Сохранение...' : isEditing ? 'Сохранить изменения' : 'Создать вакансию'}
          </button>
        </form>
      </div>
    </div>
  );
}
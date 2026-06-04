import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { enterprisesAPI } from '../services/api';
import { FiMail, FiLock, FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [enterprises, setEnterprises] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
    enterpriseId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  // Загружаем список предприятий при монтировании
  useEffect(() => {
    (async () => {
      try {
        const { data } = await enterprisesAPI.getAll();
        setEnterprises(data.enterprises || []);
      } catch (e) {
        console.error('Failed to load enterprises', e);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Заполните все поля');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      // Проверка заполнения предприятия для роли HR
      if (formData.role === 'enterprise_user' && !formData.enterpriseId) {
        setError('Выберите предприятие');
        return;
      }

      setIsLoading(true);
      try {
        await register(
          formData.email,
          formData.password,
          formData.fullName,
          formData.role,
          formData.role === 'enterprise_user' ? formData.enterpriseId : undefined
        );
        navigate(
          formData.role === 'enterprise_user'
            ? '/enterprise/dashboard'
            : '/dashboard'
        );
      } catch (err) {
        navigate(
          formData.role === 'enterprise_user'
            ? '/enterprise/dashboard'
            : '/dashboard'
        );
        setError(err.response?.data?.error || 'Ошибка регистрации');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-form-header">
        <h2>Создайте аккаунт</h2>
        <p>{step === 1 ? 'Заполните данные для входа' : 'Выберите роль'}</p>
      </div>

      {error && (
        <div className="auth-form-error">
          {error}
        </div>
      )}

      {/* Шаг 1: учетные данные */}
      {step >= 1 && (
        <form onSubmit={handleSubmit} className={step !== 1 ? 'opacity-50 pointer-events-none' : ''}>
          <div className="form-group">
            <label>ФИО</label>
            <div className="auth-input-wrapper">
              <FiUser className="auth-input-icon" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иван Иванов"
                className="form-control auth-input"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <div className="auth-input-wrapper">
              <FiMail className="auth-input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="form-control auth-input"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="form-control auth-input"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Подтвердите пароль</label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                className="form-control auth-input"
                disabled={step > 1}
              />
            </div>
          </div>

          {step === 1 && (
            <button type="submit" className="btn btn-primary btn-lg auth-submit-btn">
              Продолжить <FiArrowRight />
            </button>
          )}
        </form>
      )}

      {/* Шаг 2: выбор роли */}
      {step >= 2 && (
        <div className={step !== 2 ? 'opacity-50 pointer-events-none' : ''}>
          <p className="auth-form-role-label">Кто вы?</p>
          <div className="auth-form-role-group">
            <label
              className={`auth-form-role-option ${formData.role === 'seeker' ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value="seeker"
                checked={formData.role === 'seeker'}
                onChange={handleChange}
              />
              <div className="auth-form-role-content">
                <span className="auth-form-role-title">Соискатель</span>
                <span className="auth-form-role-subtitle">Ищу работу</span>
              </div>
            </label>

            <label
              className={`auth-form-role-option ${formData.role === 'student' ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value="student"
                checked={formData.role === 'student'}
                onChange={handleChange}
              />
              <div className="auth-form-role-content">
                <span className="auth-form-role-title">Студент</span>
                <span className="auth-form-role-subtitle">Ищу практику/стажировку</span>
              </div>
            </label>

            <label
              className={`auth-form-role-option ${formData.role === 'enterprise_user' ? 'active' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value="enterprise_user"
                checked={formData.role === 'enterprise_user'}
                onChange={handleChange}
              />
              <div className="auth-form-role-content">
                <span className="auth-form-role-title">Представитель предприятия</span>
                <span className="auth-form-role-subtitle">HR, менеджер по персоналу</span>
              </div>
            </label>
          </div>

          {formData.role === 'enterprise_user' && (
            <div className="form-group">
              <label>Выберите предприятие</label>
              <select
                name="enterpriseId"
                value={formData.enterpriseId}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">-- Выберите --</option>
                {enterprises.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="auth-form-role-actions">
            <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
              Назад
            </button>
            <button onClick={handleSubmit} disabled={isLoading} className="btn btn-primary flex-1">
              {isLoading ? 'Регистрация...' : 'Создать аккаунт'} <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      <div className="auth-form-footer">
        <Link to="/auth/login" className="auth-form-link">
          Уже есть аккаунт? <span>Войти</span>
        </Link>
      </div>
    </div>
  );
}
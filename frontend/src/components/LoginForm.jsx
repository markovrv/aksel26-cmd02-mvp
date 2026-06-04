import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-card">
      <div className="auth-form-header">
        <h2>Вход</h2>
        <p>Добро пожаловать обратно</p>
      </div>

      {error && (
        <div className="auth-form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <div className="auth-input-wrapper">
            <FiMail className="auth-input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="form-control auth-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Пароль</label>
          <div className="auth-input-wrapper">
            <FiLock className="auth-input-icon" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="form-control auth-input"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg auth-submit-btn">
          {isLoading ? 'Вход...' : 'Войти'} <FiArrowRight />
        </button>
      </form>

      <div className="auth-form-footer">
        <Link to="/auth/register" className="auth-form-link">
          Нет аккаунта? <span>Зарегистрироваться</span>
        </Link>
      </div>
    </div>
  );
}
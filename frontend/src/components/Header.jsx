import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiUser, FiMenu, FiX, FiBriefcase, FiSettings, FiMessageSquare, FiNavigation } from 'react-icons/fi';
import { authAPI, messagesAPI } from '../services/api';

export default function Header() {
  const { isAuthenticated, user, logout, setUser, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user profile on mount if authenticated
  // Поллинг непрочитанных сообщений
  useEffect(() => {
    if (!isAuthenticated || user?.role === 'superadmin') return;
    const loadUnread = async () => {
      try {
        const { data } = await messagesAPI.getThreads();
        const total = (data.threads || []).reduce((sum, t) => sum + (t.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (e) {}
    };
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    if (accessToken && !user) {
      (async () => {
        try {
          const { data } = await authAPI.getProfile();
          setUser(data.user);
        } catch (e) {
          logout();
        }
      })();
    }
  }, [accessToken, user, setUser, logout]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon"><FiNavigation size={18} /></div>
          Вперёд по маршрутам
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <div className="nav-links">
            <Link to="/enterprises" className="nav-link" onClick={() => setMenuOpen(false)}>
              Предприятия
            </Link>
            <Link to="/vacancies" className="nav-link" onClick={() => setMenuOpen(false)}>
              Вакансии
            </Link>
            <Link to="/tours" className="nav-link" onClick={() => setMenuOpen(false)}>
              Экскурсии
            </Link>
            <Link to="/how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>
              Как это работает
            </Link>
          </div>

          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="auth-section">
                {user?.role === 'enterprise_user' && (
                  <Link to="/enterprise/dashboard" className="flex items-center text-sm text-blue-600 hover:underline" onClick={() => setMenuOpen(false)}>
                    <FiBriefcase size={14} className="mr-1" /> HR-панель
                  </Link>
                )}
                {user?.role !== 'superadmin' && (
                  <Link to="/messages" className="flex items-center text-sm text-gray-600 hover:text-blue-600 relative" onClick={() => setMenuOpen(false)}>
                    <FiMessageSquare size={14} className="mr-1" />
                    Сообщения
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {user?.role === 'superadmin' && (
                  <Link to="/admin" className="flex items-center text-sm text-purple-600 hover:underline" onClick={() => setMenuOpen(false)}>
                    <FiSettings size={14} className="mr-1" /> Админ-панель
                  </Link>
                )}
                {user?.role !== 'superadmin' && (
                  <Link to="/dashboard" className="user-badge" onClick={() => setMenuOpen(false)}>
                    <FiUser size={16} />
                    <span className="user-email">{user?.email}</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut size={16} />
                  Выход
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth/login" className="btn btn-secondary btn-sm">
                  Войти
                </Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
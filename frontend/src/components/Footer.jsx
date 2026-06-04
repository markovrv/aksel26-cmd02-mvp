import { Link } from 'react-router-dom';
import { FiNavigation } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="logo-icon"><FiNavigation size={18} /></div>
              Вперёд по маршрутам
            </Link>
            <p>
              Платформа для трудоустройства на промышленные предприятия.
              ИИ-подбор вакансий, экскурсии и прямая связь с работодателями.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Telegram"><i className="fab fa-telegram"></i></a>
              <a href="#" aria-label="VK"><i className="fab fa-vk"></i></a>
              <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
              <a href="#" aria-label="GitHub"><i className="fab fa-github"></i></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Навигация</h4>
            <ul>
              <li>
                <Link to="/">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/enterprises">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Предприятия
                </Link>
              </li>
              <li>
                <Link to="/vacancies">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Вакансии
                </Link>
              </li>
              <li>
                <Link to="/tours">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Экскурсии
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Ресурсы</h4>
            <ul>
              <li>
                <Link to="/how-it-works">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Как это работает
                </Link>
              </li>
              <li>
                <Link to="/blog">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Блог
                </Link>
              </li>
              <li>
                <Link to="/faq">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support">
                  <i className="fas fa-chevron-right" style={{ fontSize: '0.625rem' }}></i>
                  Поддержка
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Контакты</h4>
            <div className="footer-contact-item">
              <i className="fas fa-envelope"></i>
              <span><a href="mailto:info@akselerator.ru">info@akselerator.ru</a></span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-phone"></i>
              <span><a href="tel:+78001234567">8 (800) 123-45-67</a></span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-clock"></i>
              <span>Пн-Пт: 9:00 - 18:00</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Акселератор 2.0. Все права защищены.</p>
        <div className="footer-links">
          <Link to="/privacy">Политика конфиденциальности</Link>
          <Link to="/terms">Условия использования</Link>
        </div>
      </div>
    </footer>
  );
}
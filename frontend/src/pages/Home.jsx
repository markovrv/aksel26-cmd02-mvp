import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FiArrowRight, FiTarget, FiMessageSquare,
  FiFileText, FiStar, FiShield, FiMapPin,
  FiUser, FiCheck, FiNavigation, FiPlay
} from 'react-icons/fi';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleEnterpriseConnect = () => {
    if (isAuthenticated) {
      if (user?.role === 'enterprise_user') {
        navigate('/enterprise/dashboard');
      } else {
        logout();
        navigate('/auth/register');
      }
    } else {
      navigate('/auth/register');
    }
  };

  return (
    <div className="home-page">
      {/* Background Grid */}
      <div className="bg-grid"></div>

      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="container">
          <div className="hero-badges">
            <div className="hero-badge">
              <FiTarget />
              ИИ-технологии
            </div>
            <div className="hero-badge">
              <FiStar />
              4+ предприятий-партнёра
            </div>
            <div className="hero-badge">
              <FiShield />
              100% конфиденциальность
            </div>
          </div>
          <h1 className="hero-title">
            Найди работу на производстве,<br />
            <span>которая тебе подходит</span>
          </h1>
          <p className="hero-subtitle">
            Профориентация, ИИ-подбор вакансий, туры по предприятиям и встроенный
            мессенджер. Мы помогаем соискателям и промышленным предприятиям
            находить друг друга.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard/assessment')} className="btn btn-primary btn-lg btn-glow">
                Пройти подбор <FiArrowRight />
              </button>
            ) : (
              <Link to="/auth/register" className="btn btn-primary btn-lg btn-glow">
                Зарегистрироваться
                <FiArrowRight />
              </Link>
            )}
            <Link to="/enterprises" className="btn btn-outline btn-lg">
              <FiPlay />
              Смотреть предприятия
            </Link>
          </div>
        </div>
      </section>

      {/* ===== СТАТИСТИКА ===== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-icon"><FiTarget /></div>
              <div className="stats-value">4</div>
              <div className="stats-label">Предприятия-партнёра</div>
            </div>
            <div className="stats-card">
              <div className="stats-icon"><FiStar /></div>
              <div className="stats-value">10+</div>
              <div className="stats-label">Активных вакансий</div>
            </div>
            <div className="stats-card">
              <div className="stats-icon"><FiNavigation /></div>
              <div className="stats-value">5</div>
              <div className="stats-label">Экскурсий доступно</div>
            </div>
            <div className="stats-card">
              <div className="stats-icon"><FiShield /></div>
              <div className="stats-value">100%</div>
              <div className="stats-label">Конфиденциальность</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== КАК ЭТО РАБОТАЕТ ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Ваш путь к работе мечты — <span>в 4 шага</span>
            </h2>
            <p className="section-desc">
              Простой и понятный алгоритм, который поможет найти идеальную
              вакансию на производстве
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <FiUser className="step-icon" />
              <h3 className="step-title">Заполните профиль</h3>
              <p className="step-desc">
                Расскажите о себе: образование, опыт, пожелания по зарплате,
                графику и условиям труда.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <FiTarget className="step-icon" />
              <h3 className="step-title">Пройдите ассессмент</h3>
              <p className="step-desc">
                Ответьте на 10 вопросов — нейросеть проанализирует ответы и
                подберёт лучшие варианты.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <FiStar className="step-icon" />
              <h3 className="step-title">Изучите рекомендации</h3>
              <p className="step-desc">
                Посмотрите предприятия и вакансии с % совпадения. Сравните
                условия, зарплаты.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <FiNavigation className="step-icon" />
              <h3 className="step-title">Посетите и устройтесь</h3>
              <p className="step-desc">
                Запишитесь на экскурсию, пообщайтесь с HR в чате и подайте отклик.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== БЛОК С КАРТИНКОЙ ===== */}
      <section className="section section-alt enterprise-section">
        <div className="container">
          <div className="enterprise-grid">
            <div className="enterprise-content">
              <div className="enterprise-badge">
                <FiStar />
                Наш партнёр
              </div>
              <h2 className="section-title-left">
                Ведомственная охрана железнодорожного транспорта
              </h2>
              <p className="section-desc-left">
                Федеральное государственное предприятие — один из наших ключевых
                партнёров. Узнайте о вакансиях стрелка ВОХР, контролёра КПП и
                практиканта.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/enterprise/fgp-vozhdt" className="btn btn-primary btn-glow">
                  Подробнее о предприятии
                  <FiArrowRight />
                </Link>
                <Link to="/tours" className="btn btn-secondary">
                  <FiMapPin />
                  Записаться на экскурсию
                </Link>
              </div>
            </div>
            <div className="enterprise-visual" style={{
              backgroundImage: `url(/uploads/enterprises/fgp-vozhdt/TransportBezop.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          </div>
        </div>
      </section>

      {/* ===== ВОЗМОЖНОСТИ ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Всё, что нужно для <span>осознанного выбора</span>
            </h2>
            <p className="section-desc">
              Современные инструменты для поиска работы на производстве
            </p>
          </div>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon">
                <FiTarget />
              </div>
              <h3 className="feature-title">ИИ-подбор вакансий</h3>
              <p className="feature-desc">
                Нейросеть анализирует ваши ответы и находит предприятия с
                максимальным совпадением по графику, зарплате, условиям труда и
                городу.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiMessageSquare />
              </div>
              <h3 className="feature-title">Встроенный мессенджер</h3>
              <p className="feature-desc">
                Общайтесь напрямую с HR предприятия. Задавайте вопросы о вакансии,
                договаривайтесь о собеседовании — всё в одном окне.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiShield />
              </div>
              <h3 className="feature-title">Полная прозрачность</h3>
              <p className="feature-desc">
                Условия труда, зарплаты, медосмотры, требования к здоровью — вся
                информация доступна до того, как вы подадите отклик.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiMapPin />
              </div>
              <h3 className="feature-title">Экскурсии на предприятия</h3>
              <p className="feature-desc">
                Офлайн и онлайн-туры по реальным рабочим местам. Посмотрите цеха,
                пообщайтесь с сотрудниками.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiFileText />
              </div>
              <h3 className="feature-title">Цифровой паспорт</h3>
              <p className="feature-desc">
                Скачайте PDF с вашим профилем, результатами ассессмента, откликами
                и забронированными экскурсиями.
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiStar />
              </div>
              <h3 className="feature-title">Персональные рекомендации</h3>
              <p className="feature-desc">
                Топ-10 вакансий с процентом совпадения. Никакого спама — только
                то, что реально подходит.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ДЛЯ ПРЕДПРИЯТИЙ ===== */}
      <section className="section section-dark">
        <div className="container">
          <div className="enterprise-grid">
            <div className="enterprise-content">
              <div className="enterprise-badge">
                <FiStar />
                Для работодателей
              </div>
              <h2 className="section-title-left" style={{ color: 'white' }}>
                Для промышленных предприятий
              </h2>
              <p className="section-desc-left" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Платформа помогает показывать реальные условия работы, проводить
                экскурсии и получать отклики от кандидатов, которым действительно
                подходит ваше производство.
              </p>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <div className="benefit-icon"><FiCheck /></div>
                  <div className="benefit-text">
                    Меньше случайных откликов — кандидаты видят реальные условия
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon"><FiCheck /></div>
                  <div className="benefit-text">
                    Сильнее бренд работодателя через экскурсии
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon"><FiCheck /></div>
                  <div className="benefit-text">
                    Встроенный чат с соискателями без сторонних мессенджеров
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon"><FiCheck /></div>
                  <div className="benefit-text">
                    Аналитика конверсии: от экскурсии до трудоустройства
                  </div>
                </div>
              </div>
              <button
                onClick={handleEnterpriseConnect}
                className="btn btn-primary btn-lg btn-glow"
              >
                Подключить предприятие
                <FiArrowRight />
              </button>
            </div>
            <div className="enterprise-visual" style={{
              backgroundImage: `url(/uploads/enterprises/fgp-vozhdt/SoprovojdenieOxranaGruzov.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-icon animate-float">
              <FiTarget />
            </div>
            <h2 className="cta-title">Готовы найти свою работу?</h2>
            <p className="cta-desc">
              Зарегистрируйтесь за 1 минуту и получите персональные рекомендации
            </p>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard/assessment')} className="btn btn-primary btn-lg btn-glow">
                Пройти подбор
                <FiArrowRight />
              </button>
            ) : (
              <Link to="/auth/register" className="btn btn-primary btn-lg btn-glow">
                Начать бесплатно
                <FiArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
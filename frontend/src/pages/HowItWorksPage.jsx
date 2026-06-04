import { Link } from 'react-router-dom';
import {
  FiUser, FiTarget, FiStar, FiNavigation,
  FiArrowRight, FiCheck, FiShield
} from 'react-icons/fi';

export default function HowItWorksPage() {
  return (
    <div className="how-it-works-page">
      {/* ===== ЗАГОЛОВОК ===== */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Как это <span>работает</span>
            </h2>
            <p className="section-desc">
              Познакомьтесь с платформой «Акселератор 2.0» — 
              мы помогаем соискателям находить работу на производстве, 
              а предприятиям — мотивированных сотрудников.
            </p>
          </div>
        </div>
      </section>

      {/* ===== ПОДРОБНЫЕ ШАГИ ===== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Ваш путь к новой работе — <span>всего 4 шага</span>
            </h2>
            <p className="section-desc">
              Процесс устроен так, чтобы вы могли принять осознанное решение и 
              найти место, которое действительно подходит именно вам.
            </p>
          </div>

          <div className="steps-detailed">
            <div className="step-detailed-card">
              <div className="step-detailed-number">
                <FiUser size={28} />
              </div>
              <div className="step-detailed-content">
                <h3>Шаг 1: Заполните профиль</h3>
                <p>
                  Расскажите о себе: укажите образование, опыт работы, 
                  пожелания по зарплате, предпочтительный график и условия труда. 
                  Вся информация остаётся конфиденциальной и не передаётся 
                  работодателям без вашего согласия.
                </p>
                <ul className="step-detailed-list">
                  <li><FiCheck /> Личные данные и контакты</li>
                  <li><FiCheck /> Образование и профессиональный опыт</li>
                  <li><FiCheck /> Пожелания по зарплате и графику</li>
                  <li><FiCheck /> Предпочтения по условиям труда</li>
                </ul>
              </div>
            </div>

            <div className="step-detailed-card">
              <div className="step-detailed-number">
                <FiTarget size={28} />
              </div>
              <div className="step-detailed-content">
                <h3>Шаг 2: Пройдите ассессмент</h3>
                <p>
                  Ответьте на 10 вопросов — нейросеть проанализирует ваши ответы 
                  и определит, какие предприятия и вакансии подходят вам 
                  максимально. Ассессмент учитывает не только навыки, но и ваши 
                  личные предпочтения.
                </p>
                <ul className="step-detailed-list">
                  <li><FiCheck /> 10 вопросов — 5 минут</li>
                  <li><FiCheck /> ИИ-анализ ваших ответов</li>
                  <li><FiCheck /> Учёт личных предпочтений</li>
                  <li><FiCheck /> Мгновенный результат</li>
                </ul>
              </div>
            </div>

            <div className="step-detailed-card">
              <div className="step-detailed-number">
                <FiStar size={28} />
              </div>
              <div className="step-detailed-content">
                <h3>Шаг 3: Изучите рекомендации</h3>
                <p>
                  Посмотрите топ-10 вакансий с процентом совпадения. Сравните 
                  условия труда, зарплаты, расположение предприятий. Вся 
                  информация о вакансиях доступна до подачи отклика — 
                  никакой скрытой информации.
                </p>
                <ul className="step-detailed-list">
                  <li><FiCheck /> Топ-10 с % совпадения</li>
                  <li><FiCheck /> Детальная информация о вакансиях</li>
                  <li><FiCheck /> Сравнение условий и зарплат</li>
                  <li><FiCheck /> Прозрачные требования к здоровью</li>
                </ul>
              </div>
            </div>

            <div className="step-detailed-card">
              <div className="step-detailed-number">
                <FiNavigation size={28} />
              </div>
              <div className="step-detailed-content">
                <h3>Шаг 4: Посетите и устройтесь</h3>
                <p>
                  Запишитесь на экскурсию на предприятие (офлайн или онлайн), 
                  пообщайтесь с HR в встроенном мессенджере, задайте вопросы 
                  и подайте отклик на вакансию. Всё в одном месте — без 
                  сторонних мессенджеров и сервисов.
                </p>
                <ul className="step-detailed-list">
                  <li><FiCheck /> Офлайн и онлайн-экскурсии</li>
                  <li><FiCheck /> Чат с HR напрямую</li>
                  <li><FiCheck /> Подача отклика в один клик</li>
                  <li><FiCheck /> Отслеживание статуса заявки</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
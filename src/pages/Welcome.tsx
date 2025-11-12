import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSd9UM1KqOoBBwnzIiu7nmPR0Yz3nyyQGxi4NzCoMynN8Dc_sw/viewform";

const Welcome = () => {
  const [activeTab, setActiveTab] = useState<'parents' | 'children'>('parents');
  const formRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="welcome-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Образовательная платформа нового поколения
          </h1>
          <p className="hero-subtitle">
            Интеллектуальный помощник для эффективного обучения математике 
            с искусственным интеллектом, который понимает потребности каждого ребенка
          </p>
          <div className="hero-buttons">
            <button className="btn primary" onClick={scrollToForm}>
              Помочь развитию сайта
            </button>
            <button className="btn secondary" onClick={() => navigate('/app')}>
              Перейти на сайт
            </button>
          </div>
        </div>
        <div className="hero-animation">
          <div className="floating-elements">
            <div className="floating-element element-1">📚</div>
            <div className="floating-element element-2">🎓</div>
            <div className="floating-element element-3">⭐</div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="tabs-section">
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'parents' ? 'active' : ''}`}
            onClick={() => setActiveTab('parents')}
          >
            👨‍👩‍👧‍👦 Для родителей
          </button>
          <button 
            className={`tab-btn ${activeTab === 'children' ? 'active' : ''}`}
            onClick={() => setActiveTab('children')}
          >
            🧒 Для детей
          </button>
        </div>

        {/* Parents Content */}
        {activeTab === 'parents' && (
          <div className="tab-content">
            <h2>Решаем главные проблемы родителей</h2>
            
            <div className="flip-cards-container">
              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">⏰</div>
                    <h3>Экономим время и силы</h3>
                    <p>Устали тратить вечера на домашние задания?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">🚀</div>
                    <h3>Решение</h3>
                    <p>ИИ-помощник берет на себя объяснение ДЗ и тренировку навыков</p>
                  </div>
                </div>
              </div>

              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">😔</div>
                    <h3>Уроки без ссор</h3>
                    <p>Конфликты из-за домашних заданий портят отношения?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">✨</div>
                    <h3>Решение</h3>
                    <p>Нейтральный ИИ-наставник и понятные шаги — учёба без конфликтов</p>
                  </div>
                </div>
              </div>

              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">💸</div>
                    <h3>Меньше расходов</h3>
                    <p>Репетиторы и допзанятия ударяют по бюджету?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">💰</div>
                    <h3>Решение</h3>
                    <p>Доступная подписка вместо дорогих репетиторов</p>
                  </div>
                </div>
              </div>

              <div className="flip-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">📚</div>
                    <h3>Закрываем пробелы</h3>
                    <p>Ребенок не успевает за школьной программой?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">🎯</div>
                    <h3>Решение</h3>
                    <p>Диагностика уровня и персональный план обучения</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section - только для родителей */}
            <div className="pricing-section">
              <h2 className="pricing-title">Выберите подходящий тариф</h2>
              <p className="pricing-subtitle">
                Начните с бесплатной недели и выберите оптимальный формат обучения
              </p>
              
              <div className="pricing-cards">
                {/* Бесплатная неделя */}
                <div className="pricing-card">
                  <div className="pricing-card-header">
                    <div className="pricing-card-icon">🎁</div>
                    <h3 className="pricing-card-title">Первая неделя</h3>
                    <p className="pricing-card-description">
                      Идеально для знакомства с платформой
                    </p>
                  </div>
                  
                  <div className="pricing-card-price">
                    <div className="price-amount">Бесплатно</div>
                    <div className="price-period">7 дней полного доступа</div>
                  </div>
                  
                  <ul className="pricing-features">
                    <li className="pricing-feature">Полный доступ к нашему сайту</li>
                    <li className="pricing-feature">Неограниченное количество запросов</li>
                    <li className="pricing-feature">Помощь с домашним заданием</li>
                    <li className="pricing-feature">Аналитика прогресса</li>
                    <li className="pricing-feature">Объяснение материалов</li>
                    <li className="pricing-feature">ДСоставление учебного плана</li>
                  </ul>
                  
                  <button className="btn secondary">
                    Начать бесплатно
                  </button>
                </div>

                {/* Месячный тариф */}
                <div className="pricing-card popular">
                  <div className="popular-badge">Самый популярный</div>
                  <div className="pricing-card-header">
                    <div className="pricing-card-icon">🚀</div>
                    <h3 className="pricing-card-title">На месяц</h3>
                    <p className="pricing-card-description">
                      Оптимальный выбор для регулярных занятий
                    </p>
                  </div>
                  
                  <div className="pricing-card-price">
                    <div className="price-amount">₽990</div>
                    <div className="price-period">в месяц</div>
                  </div>
                  
                  <ul className="pricing-features">
                    <li className="pricing-feature">Полный доступ к нашему сайту</li>
                    <li className="pricing-feature">Неограниченное количество запросов</li>
                    <li className="pricing-feature">Помощь с домашним заданием</li>
                    <li className="pricing-feature">Аналитика прогресса</li>
                    <li className="pricing-feature">Объяснение материалов</li>
                    <li className="pricing-feature">ДСоставление учебного плана</li>
                  </ul>
                  
                  <button className="btn primary">
                    Выбрать тариф
                  </button>
                </div>

                {/* Годовой тариф */}
                <div className="pricing-card">
                  <div className="pricing-card-header">
                    <div className="pricing-card-icon">👑</div>
                    <h3 className="pricing-card-title">На год</h3>
                    <p className="pricing-card-description">
                      Максимальная выгода для серьезных результатов
                    </p>
                  </div>
                  
                  <div className="pricing-card-price">
                    <div className="price-amount">₽9,900</div>
                    <div className="price-period">в год (экономьте 2 месяца)</div>
                  </div>
                  
                  <ul className="pricing-features">
                    <li className="pricing-feature">Полный доступ к нашему сайту</li>
                    <li className="pricing-feature">Неограниченное количество запросов</li>
                    <li className="pricing-feature">Помощь с домашним заданием</li>
                    <li className="pricing-feature">Аналитика прогресса</li>
                    <li className="pricing-feature">Объяснение материалов</li>
                    <li className="pricing-feature">ДСоставление учебного плана</li>
                  </ul>
                  
                  <button className="btn primary">
                    Выбрать тариф
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Children Content */}
        {activeTab === 'children' && (
          <div className="tab-content">
            <h2>Учись с удовольствием!</h2>
            
            <div className="flip-cards-container">
              <div className="flip-card student-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">🤔</div>
                    <h3>Разобраться и поверить в себя</h3>
                    <p>Когда что-то непонятно и не получается</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">💡</div>
                    <h3>Наше решение</h3>
                    <p>Пошаговые объяснения и тренировка до уверенного "получается!"</p>
                  </div>
                </div>
              </div>

              <div className="flip-card student-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">😥</div>
                    <h3>Подтянуться без стресса</h3>
                    <p>Сложно успевать за классом?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">🌱</div>
                    <h3>Наше решение</h3>
                    <p>Короткие мини-занятия и доброжелательные подсказки</p>
                  </div>
                </div>
              </div>

              <div className="flip-card student-card">
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="flip-card-icon">⭐</div>
                    <h3>Расти быстрее программы</h3>
                    <p>Хочется больше интересных заданий?</p>
                  </div>
                  <div className="flip-card-back">
                    <div className="flip-card-icon">🚀</div>
                    <h3>Наше решение</h3>
                    <p>Челлендж-треки и нестандартные задачи</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section ref={formRef} className="cta-section">
        <div className="cta-content">
          <h2>Готовы помочь развитию?</h2>
          <p>
            Ваше мнение поможет нам стать лучше! Присоединяйтесь к сообществу, 
            которое создает образование будущего вместе с нами.
          </p>
          <button 
            className="btn primary large"
            onClick={() => window.open(GOOGLE_FORM_LINK, '_blank')}
          >
            Отправить данные
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="company-name">EduAI Platform</div>
            <p className="company-tagline">
              Образовательная платформа нового поколения с искусственным интеллектом, 
              которая делает обучение математике эффективным и увлекательным.
            </p>
          </div>
          
          
          
          <div className="footer-links">
            <h4 className="footer-heading">Поддержка</h4>
            <a href="#" className="footer-link">🔒 Безопасность</a>
            <a href="#" className="footer-link">📄 Условия использования</a>
          </div>
          
        <div className="contact-info">
            <h4 className="footer-heading">Контакты</h4>
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <span>hello@eduai-platform.ru</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 EduAI Platform. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
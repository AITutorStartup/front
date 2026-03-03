import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import './Welcome.css';
import logoBlack from '../../assets/Logo_black.png';

const GOOGLE_FORM_LINK =
  'https://docs.google.com/forms/d/e/1FAIpQLSd9UM1KqOoBBwnzIiu7nmPR0Yz3nyyQGxi4NzCoMynN8Dc_sw/viewform';

/* ════════════════════════════════════════════
   ACETERNITY-STYLE INLINE COMPONENTS
════════════════════════════════════════════ */

/** BackgroundBeams – animated SVG beam lines radiating from centre-bottom */
function BackgroundBeams() {
  const paths = [
    'M 0 800 Q 200 400 400 0',
    'M 200 900 Q 350 450 550 0',
    'M 400 1000 Q 500 500 600 0',
    'M 600 900 Q 650 450 700 0',
    'M 800 800 Q 750 400 800 0',
    'M 1000 900 Q 900 450 900 0',
    'M 1200 800 Q 1050 400 1000 0',
    'M 100 1000 Q 300 600 450 0',
    'M 700 1000 Q 800 600 850 0',
  ];
  return (
    <svg
      className="bg-beams"
      viewBox="0 0 1200 1000"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="bg-fade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="1" />
        </radialGradient>
      </defs>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.35, 0.15] }}
          transition={{
            duration: 3.5 + i * 0.4,
            delay: i * 0.2,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}
      <rect x="0" y="0" width="1200" height="1000" fill="url(#bg-fade)" />
    </svg>
  );
}

/** SparklesCore – lightweight canvas particle ambient effect */
function SparklesCore({ count = 60 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Parse --primary from CSS for particle colour
    const style = getComputedStyle(document.documentElement);
    const raw = style.getPropertyValue('--primary').trim();
    const particleColor = raw ? `hsl(${raw})` : '#7c6ff7';

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random(),
      delta: Math.random() * 0.012 + 0.004,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.alpha += p.delta;
        if (p.alpha > 1 || p.alpha < 0) p.delta *= -1;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="sparkles-canvas" aria-hidden />;
}

/** TypewriterEffect – word-by-word reveal */
function TypewriterEffect({ text }: { text: string }) {
  const words = text.split(' ');
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <p ref={ref} className="typewriter-wrap" aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="typewriter-word"
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.4, delay: i * 0.04, ease: 'easeOut' }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </p>
  );
}

/** MovingBorder – animated gradient border button */
function MovingBorderButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
}) {
  return (
    <motion.button
      className={`mb-btn mb-btn--${variant} mb-btn--${size}`}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
    >
      {variant === 'primary' && <span className="mb-btn__border" aria-hidden />}
      <span className="mb-btn__label">{children}</span>
    </motion.button>
  );
}

/** HoverEffectCard – glassmorphism card with glow on hover */
function HoverCard({
  icon,
  title,
  body,
  sub,
  delay = 0,
  wide = false,
}: {
  icon: string;
  title: string;
  body: string;
  sub: string;
  delay?: number;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`hc ${wide ? 'hc--wide' : ''}`}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="hc__glow" aria-hidden />
      <span className="hc__icon">{icon}</span>
      <h3 className="hc__title">{title}</h3>
      <p className="hc__body">{body}</p>
      <div className="hc__divider" />
      <p className="hc__sub">{sub}</p>
    </motion.div>
  );
}

/** FadeInWhenVisible – universal scroll-triggered reveal */
function FIV({
  children,
  delay = 0,
  className = '',
  y = 40,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Animated counter */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 33);
    return () => clearInterval(id);
  }, [inView, target]);

  return <span ref={ref}>{val}{suffix}</span>;
}

/* ════════════════════════════════════════════
   DATA
════════════════════════════════════════════ */

const PARENT_CARDS = [
  { icon: '⏰', title: 'Экономим время и силы',       body: 'Устали тратить вечера на домашние задания?',          sub: 'ИИ-помощник берет на себя объяснение ДЗ и тренировку навыков' },
  { icon: '😔', title: 'Уроки без ссор',               body: 'Конфликты из-за домашних заданий портят отношения?',  sub: 'Нейтральный ИИ-наставник и понятные шаги — учёба без конфликтов' },
  { icon: '💸', title: 'Меньше расходов',              body: 'Репетиторы и допзанятия ударяют по бюджету?',          sub: 'Доступная подписка вместо дорогих репетиторов' },
  { icon: '📚', title: 'Закрываем пробелы',            body: 'Ребенок не успевает за школьной программой?',          sub: 'Диагностика уровня и персональный план обучения' },
];

const CHILD_CARDS = [
  { icon: '🤔', title: 'Разобраться и поверить в себя', body: 'Когда что-то непонятно и не получается',        sub: 'Пошаговые объяснения и тренировка до уверенного "получается!"' },
  { icon: '😥', title: 'Подтянуться без стресса',       body: 'Сложно успевать за классом?',                   sub: 'Короткие мини-занятия и доброжелательные подсказки' },
  { icon: '⭐', title: 'Расти быстрее программы',       body: 'Хочется больше интересных заданий?',             sub: 'Челлендж-треки и нестандартные задачи' },
];

const PLANS = [
  { icon: '🎁', title: 'Первая неделя', desc: 'Идеально для знакомства с платформой',          price: 'Бесплатно', period: '7 дней полного доступа',              popular: false, cta: 'Начать бесплатно', primary: false },
  { icon: '🚀', title: 'На месяц',      desc: 'Оптимальный выбор для регулярных занятий',      price: '₽990',      period: 'в месяц',                              popular: true,  cta: 'Выбрать тариф',   primary: true  },
  { icon: '👑', title: 'На год',        desc: 'Максимальная выгода для серьезных результатов', price: '₽9 900',    period: 'в год (экономьте 2 месяца)',            popular: false, cta: 'Выбрать тариф',   primary: true  },
];

const FEATURES = [
  'Полный доступ к нашему сайту',
  'Неограниченное количество запросов',
  'Помощь с домашним заданием',
  'Аналитика прогресса',
  'Объяснение материалов',
  'Составление учебного плана',
];

/* ════════════════════════════════════════════
   NAVBAR
════════════════════════════════════════════ */

function Navbar({ onScroll, onNavigate }: { onScroll: () => void; onNavigate: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScrollFn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScrollFn);
    return () => window.removeEventListener('scroll', onScrollFn);
  }, []);

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="navbar__inner">
        <img src={logoBlack} alt="T-Ask" className="navbar__logo-img" />
        <div className="navbar__right">
          <motion.button
            className="navbar__cta"
            onClick={onNavigate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            Перейти на сайт
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

/* ════════════════════════════════════════════
   STATS BAR
════════════════════════════════════════════ */

function StatsBar() {
  return (
    <FIV className="stats-bar" y={20}>
      <div className="stats-bar__inner">
        {[
          { num: 500, suffix: '+', label: 'Учеников' },
          { num: 98, suffix: '%', label: 'Довольных родителей' },
          { num: 4.9, suffix: '★', label: 'Средняя оценка', float: true },
        ].map((s, i) => (
          <div key={i} className="stat">
            <div className="stat__num">
              {s.float
                ? <span>{s.num}{s.suffix}</span>
                : <><CountUp target={s.num} />{s.suffix}</>
              }
            </div>
            <div className="stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </FIV>
  );
}

/* ════════════════════════════════════════════
   PRICING CARD
════════════════════════════════════════════ */

function PricingCard({ plan, delay }: { plan: typeof PLANS[0]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`pc ${plan.popular ? 'pc--popular' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -16, boxShadow: '0 40px 80px hsl(var(--primary) / 0.22)' }}
    >
      {plan.popular && <div className="pc__badge">Самый популярный</div>}
      <div className="pc__top-line" />
      <div className="pc__header">
        <span className="pc__icon">{plan.icon}</span>
        <h3 className="pc__title">{plan.title}</h3>
        <p className="pc__desc">{plan.desc}</p>
      </div>
      <div className="pc__price-block">
        <div className="pc__price">{plan.price}</div>
        <div className="pc__period">{plan.period}</div>
      </div>
      <ul className="pc__features">
        {FEATURES.map((f) => (
          <li key={f} className="pc__feat">{f}</li>
        ))}
      </ul>
      <motion.button
        className={`plan-btn ${plan.primary ? 'plan-btn--primary' : 'plan-btn--secondary'}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */

const Welcome = () => {
  const [activeTab, setActiveTab] = useState<'parents' | 'children'>('parents');
  const formRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform =
          `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="wc">
      {/* Cursor glow overlay */}
      <div ref={cursorGlowRef} className="cursor-glow" aria-hidden />

      {/* ── Navbar ── */}
      <Navbar onScroll={scrollToForm} onNavigate={() => navigate('/app')} />

      {/* ══ HERO ══ */}
      <section className="hero">
        {/* Background effects in isolated overflow:hidden layer */}
        <div className="hero__bg" aria-hidden>
          <BackgroundBeams />
          <div className="hero__orb" />
        </div>

        <div className="hero__inner">
          <motion.div
            className="hero__content"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div
              className="hero__badge"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
            >
              ✦ Образование нового поколения
            </motion.div>

            <motion.h1
              className="hero__title"
              variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            >
              Образовательная
              <br />
              <em className="hero__title-em">платформа</em>
              <br />
              нового поколения
            </motion.h1>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6 }}
            >
              <TypewriterEffect text="Интеллектуальный помощник для эффективного обучения математике с искусственным интеллектом, который понимает потребности каждого ребенка" />
            </motion.div>

            <motion.div
              className="hero__btns"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
            >
              <MovingBorderButton onClick={scrollToForm} variant="primary" size="lg">
                Помочь развитию сайта
              </MovingBorderButton>
              <MovingBorderButton onClick={() => navigate('/app')} variant="secondary" size="lg">
                Перейти на сайт
              </MovingBorderButton>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* ══ PROBLEMS + TABS ══ */}
      <section className="problems-section">
        <FIV className="section-label-wrap">
          <span className="section-label">Решаем главные проблемы</span>
        </FIV>
        <FIV delay={0.1}>
          <h2 className="section-title">Почему выбирают T-Ask</h2>
        </FIV>

        {/* Tab pills */}
        <FIV delay={0.15} className="tabs-header">
          <div className="tabs-pills">
            {(['parents', 'children'] as const).map((tab) => (
              <button
                key={tab}
                className={`tabs-pill ${activeTab === tab ? 'tabs-pill--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'parents' ? '👨‍👩‍👧‍👦 Для родителей' : '🧒 Для детей'}
                {activeTab === tab && (
                  <motion.span
                    className="tabs-pill__bg"
                    layoutId="pill-bg"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </FIV>

        {/* Tab content — cards only */}
        <AnimatePresence mode="wait">
          {activeTab === 'parents' ? (
            <motion.div
              key="parents"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="hc-grid hc-grid--4">
                {PARENT_CARDS.map((c, i) => (
                  <HoverCard key={c.title} icon={c.icon} title={c.title} body={c.body} sub={c.sub} delay={i * 0.08} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="children"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="hc-grid hc-grid--3">
                {CHILD_CARDS.map((c, i) => (
                  <HoverCard key={c.title} icon={c.icon} title={c.title} body={c.body} sub={c.sub} delay={i * 0.1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══ PRICING ══ */}
      <section className="pricing-section">
        <FIV delay={0.05}>
          <h2 className="section-title">Выберите подходящий тариф</h2>
          <p className="section-sub">Начните с бесплатной недели и выберите оптимальный формат обучения</p>
        </FIV>
        <div className="pricing-row">
          {PLANS.map((p, i) => (
            <PricingCard key={p.title} plan={p} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section ref={formRef} className="cta-section">
        <SparklesCore count={80} />
        <FIV className="cta-content">
          <h2 className="cta-title">Готовы помочь развитию?</h2>
          <p className="cta-sub">
            Ваше мнение поможет нам стать лучше! Присоединяйтесь к сообществу,
            которое создает образование будущего вместе с нами.
          </p>
          <MovingBorderButton
            onClick={() => window.open(GOOGLE_FORM_LINK, '_blank')}
            variant="primary"
            size="lg"
          >
            Рассказать о себе
          </MovingBorderButton>
        </FIV>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <img src={logoBlack} alt="T-Ask" className="footer__logo-img" />
            <p className="footer__tagline">
              Образовательная платформа нового поколения с искусственным интеллектом,
              которая делает обучение математике эффективным и увлекательным.
            </p>
          </div>
          <div className="footer__links">
            <span className="footer__heading">Поддержка</span>
            <a href="#" className="footer__link">🔒 Безопасность</a>
            <a href="#" className="footer__link">📄 Условия использования</a>
          </div>
        </div>
        <div className="footer__bottom">© 2025 T-Ask. Все права защищены.</div>
      </footer>
    </div>
  );
};

export default Welcome;

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/ui/button";
import styles from "./Auth.module.css";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [searchParams] = useSearchParams();
  
  const locationState = location.state as { from?: string; flash?: string } | null;
  const redirectFrom = locationState?.from || "/theory";

  // Определяем режим из URL при монтировании и изменении пути
  useEffect(() => {
    const path = location.pathname.split("/").pop();
    const mode = searchParams.get("mode");
    const shouldBeLogin = path !== "register" && mode !== "register";
    setIsLogin(shouldBeLogin);
  }, [location.pathname, searchParams]);

  // Обрабатываем flash сообщения
  useEffect(() => {
    if (locationState?.flash) {
      setInfo(locationState.flash);
    }
  }, [locationState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      await refresh();
      setInfo("Вход выполнен. Перенаправляем...");
      
      // Навигация происходит независимо от ошибок API
      setTimeout(() => {
        navigate(redirectFrom, { replace: true });
      }, 500);
    } catch (err: any) {
      setError(err.message || "Не удалось войти");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (name.trim().length < 2) {
      setError("Имя должно содержать минимум 2 символа.");
      return;
    }

    if (password.length < 12) {
      setError("Пароль должен быть не короче 12 символов.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", { name: name.trim(), email: email.trim(), password });
      setInfo("Аккаунт создан. Переключаемся на вход...");
      setTimeout(() => {
        setIsLogin(true);
        setInfo("Аккаунт создан. Войдите и подтвердите почту.");
        setName("");
        setPassword("");
        setEmail("");
      }, 1500);
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "Не удалось зарегистрироваться";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      
      // Если это ошибка сети, показываем более понятное сообщение
      if (errorMessage.includes("fetch") || errorMessage.includes("подключиться")) {
        errorMessage = "Ошибка подключения к серверу. Проверьте интернет-соединение и попробуйте снова.";
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setInfo(null);
    setIsLogin(!isLogin);
  };

  return (
    <div className={styles.authContainer}>
      <div className={`${styles.splitContainer} ${!isLogin ? styles.registerMode : ""}`}>
        {/* Form Panel (Left when login, Right when register) */}
        <div className={`${styles.formPanel} ${isLogin ? styles.leftPanel : styles.rightPanel}`}>
          {isLogin ? (
            <>
              <h1 className={styles.title}>Вход в аккаунт</h1>
              <form onSubmit={handleLogin} className={styles.form}>
                {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
                {info && <div className={`${styles.status} ${styles.info}`}>{info}</div>}
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Электронная почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Забыли пароль?
                </Link>
                <Button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? "Вхожу..." : "ВОЙТИ"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className={styles.title}>Создать аккаунт</h1>
              <form onSubmit={handleRegister} className={styles.form}>
                {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
                {info && <div className={`${styles.status} ${styles.info}`}>{info}</div>}
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                    required
                    minLength={2}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Электронная почта"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    required
                    minLength={12}
                  />
                </div>
                <Button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? "Создаём..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
                </Button>
              </form>
            </>
          )}
        </div>

        {/* Welcome Panel (Right when login, Left when register) */}
        <div className={`${styles.welcomePanel} ${isLogin ? styles.rightPanel : styles.leftPanel}`}>
          <div className={styles.welcomeContent}>
            <h2 className={styles.welcomeTitle}>
              {isLogin ? "С возвращением!" : "Привет, друг!"}
            </h2>
            <p className={styles.welcomeText}>
              {isLogin 
                ? "Войдите, используя свои данные, чтобы использовать все возможности сайта"
                : "Зарегистрируйтесь, используя свои данные, чтобы использовать все возможности сайта"}
            </p>
            <button type="button" onClick={toggleMode} className={styles.toggleButton}>
              {isLogin ? "ЗАРЕГИСТРИРОВАТЬСЯ" : "ВОЙТИ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;


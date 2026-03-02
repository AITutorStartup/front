import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/button";
import styles from "./Auth.module.css";
import { api } from "@/lib/api";
import { useAuth } from "../AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
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
      await api.post("/auth/loginEmail", { email, password });
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
      await api.post("/auth/register", { first_name: name.trim(), email: email.trim(), password });
      setRegisteredEmail(email.trim());
      setLoading(false);
    } catch (err: any) {
      let errorMessage =
        err?.message && typeof err.message === "string"
          ? err.message
          : typeof err === "string"
          ? err
          : "Не удалось зарегистрироваться";

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
    <motion.div
      className={styles.authContainer}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        className={styles.orb1}
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={styles.orb2}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className={`${styles.splitContainer} ${!isLogin ? styles.registerMode : ""}`}>
        {/* Form Panel (Left when login, Right when register) */}
        <div className={`${styles.formPanel} ${isLogin ? styles.leftPanel : styles.rightPanel}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? (registeredEmail ? "success" : "login") : "register"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              {isLogin ? (
                <>
                  <h1 className={styles.title}>Вход в аккаунт</h1>
                  <form onSubmit={handleLogin} className={styles.form}>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className={`${styles.status} ${styles.error}`}
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {info && (
                        <motion.div
                          className={`${styles.status} ${styles.info}`}
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {info}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0 * 0.08, duration: 0.4 }}
                    >
                      <input
                        type="email"
                        placeholder="Электронная почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </motion.div>
                    <motion.div
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 * 0.08, duration: 0.4 }}
                    >
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </motion.div>
                    <Link to="/forgot-password" className={styles.forgotLink}>
                      Забыли пароль?
                    </Link>
                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                      {loading ? "Вхожу..." : "ВОЙТИ"}
                    </Button>
                  </form>
                </>
              ) : registeredEmail ? (
                <>
                  <h1 className={styles.title}>Аккаунт создан!</h1>
                  <div className={styles.form}>
                    <div className={`${styles.status} ${styles.info}`}>
                      Аккаунт для <strong>{registeredEmail}</strong> успешно создан. Подтвердите почту, чтобы войти.
                    </div>
                    <Button
                      type="button"
                      className={styles.submitButton}
                      onClick={() => navigate(`/verify-email?email=${encodeURIComponent(registeredEmail)}`)}
                    >
                      ПОДТВЕРДИТЬ ПОЧТУ
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisteredEmail(null);
                        setIsLogin(true);
                        setEmail("");
                        setPassword("");
                        setName("");
                      }}
                      className={styles.secondaryButton}
                    >
                      Войти в аккаунт
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className={styles.title}>Создать аккаунт</h1>
                  <form onSubmit={handleRegister} className={styles.form}>
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          className={`${styles.status} ${styles.error}`}
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {info && (
                        <motion.div
                          className={`${styles.status} ${styles.info}`}
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {info}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.div
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0 * 0.08, duration: 0.4 }}
                    >
                      <input
                        type="text"
                        placeholder="Имя пользователя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                        required
                        minLength={2}
                      />
                    </motion.div>
                    <motion.div
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 * 0.08, duration: 0.4 }}
                    >
                      <input
                        type="email"
                        placeholder="Электронная почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                      />
                    </motion.div>
                    <motion.div
                      className={styles.inputGroup}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 * 0.08, duration: 0.4 }}
                    >
                      <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                        minLength={12}
                      />
                    </motion.div>
                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                      {loading ? "Создаём..." : "ЗАРЕГИСТРИРОВАТЬСЯ"}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Welcome Panel (Right when login, Left when register) */}
        <div className={`${styles.welcomePanel} ${isLogin ? styles.rightPanel : styles.leftPanel}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "welcome-login" : "welcome-register"}
              className={styles.welcomeContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Auth;

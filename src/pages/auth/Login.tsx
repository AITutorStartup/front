import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import styles from "./Auth.module.css";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const locationState = location.state as { from?: string; flash?: string } | null;
  const [info, setInfo] = useState<string | null>(locationState?.flash || null);
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const redirectFrom = locationState?.from || "/theory";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      await refresh();

      let nextRoute = redirectFrom;
      try {
        const verifyStatus = await api.get<{ is_active: boolean }>("/users/verify_email_status");
        if (!verifyStatus.is_active) {
          nextRoute = "/verify-email";
          setInfo("Вход выполнен. Подтвердите почту, чтобы продолжить.");
        } else {
          setInfo("Вход выполнен. Перенаправляем...");
        }
      } catch {
        nextRoute = "/verify-email";
        setInfo("Не удалось проверить почту, откроем страницу подтверждения.");
      }

      navigate(nextRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Вход в аккаунт</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
          {info && <div className={`${styles.status} ${styles.info}`}>{info}</div>}
          <input
            type="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <Button type="submit" disabled={loading}>{loading ? "Вхожу..." : "Войти"}</Button>
        </form>
        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
          <p className={styles.link} style={{ textAlign: "left", margin: 0 }}>
            Нет аккаунта? <Link to="/register" style={{ textDecoration: "none" }}>Зарегистрироваться</Link>
          </p>
          <Link to="/forgot-password" className={styles.link} style={{ fontSize: "0.9em", textAlign: "left", textDecoration: "none" }}>
            Забыли пароль?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

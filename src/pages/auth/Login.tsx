import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import styles from "./Auth.module.css";
import { api, saveAuthToken } from "@/lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/auth/login", { email, password });
      saveAuthToken(res.token);
      navigate("/theory");
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
          {error && <div className={styles.error}>{error}</div>}
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
        <p className={styles.link}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import Button from "@/components/common/Button"; 
import styles from "./Auth.module.css"; 
import { api } from "@/lib/api";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      navigate("/login", {
        state: {
          flash: "Аккаунт создан. Войдите и подтвердите почту.",
        },
      });
    } catch (err: any) {
      setError(err.message || "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Создать аккаунт</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
          <input
            type="text"
            placeholder="Имя пользователя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
            minLength={2}
          />
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
            minLength={12}
          />
          <Button type="submit" disabled={loading}>{loading ? "Создаём..." : "Зарегистрироваться"}</Button>
        </form>
        <p className={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

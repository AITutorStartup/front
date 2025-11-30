import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/components/common/Button";
import styles from "./Auth.module.css";
import { resetPasswordRequest } from "@/lib/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await resetPasswordRequest(email);
            setMessage("Если аккаунт с такой почтой существует, мы отправили инструкцию по сбросу пароля.");
        } catch (err: any) {
            setError(err.message || "Произошла ошибка при отправке запроса.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <h1 className={styles.title}>Сброс пароля</h1>
                <p className={styles.subtitle}>
                    Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {message && <div className={`${styles.status} ${styles.success}`}>{message}</div>}
                    {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
                    <input
                        type="email"
                        placeholder="Электронная почта"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </form>
                <p className={styles.link}>
                    Вспомнили пароль? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;

import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/common/Button";
import styles from "./Auth.module.css";
import { resetPasswordConfirm } from "@/lib/api";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        if (!token) {
            setError("Неверная ссылка для сброса пароля.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await resetPasswordConfirm({ token, new_password: password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Не удалось сбросить пароль.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.formWrapper}>
                    <div className={`${styles.status} ${styles.error}`}>
                        Отсутствует токен сброса пароля. Перейдите по ссылке из письма.
                    </div>
                    <p className={styles.link}>
                        <Link to="/login">Вернуться на страницу входа</Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.authContainer}>
            <div className={styles.formWrapper}>
                <h1 className={styles.title}>Новый пароль</h1>
                {success ? (
                    <div className={`${styles.status} ${styles.success}`}>
                        Пароль успешно изменен. Перенаправляем на страницу входа...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
                        <input
                            type="password"
                            placeholder="Новый пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Подтвердите пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Сохранение..." : "Сохранить пароль"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;

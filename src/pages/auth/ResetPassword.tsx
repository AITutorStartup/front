import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import styles from "./Auth.module.css";
import { resetPasswordConfirm } from "@/lib/api";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }
        if (code.length !== 6) {
            setError("Код должен состоять из 6 цифр");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await resetPasswordConfirm({ email, code, new_password: password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Не удалось сбросить пароль.");
        } finally {
            setLoading(false);
        }
    };

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
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Код из письма"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={styles.input}
                            required
                            maxLength={6}
                        />
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
                <p className={styles.link}>
                    <Link to="/login">Вернуться на страницу входа</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;

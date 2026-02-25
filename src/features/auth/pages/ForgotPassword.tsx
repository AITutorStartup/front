import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import styles from "./Auth.module.css";
import { resetPasswordRequest } from "@/lib/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            await resetPasswordRequest(email);
            setMessage("Код отправлен на вашу почту.");
            setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 1500);
        } catch (err: any) {
            setError(err.message || "Произошла ошибка при отправке запроса.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.splitContainer}>
                {/* Form Panel - Left */}
                <div className={`${styles.formPanel} ${styles.leftPanel}`}>
                <h1 className={styles.title}>Сброс пароля</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {message && <div className={`${styles.status} ${styles.success}`}>{message}</div>}
                    {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
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
                        <Button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </form>
                    <p style={{ 
                        marginTop: "1.5rem", 
                        textAlign: "center", 
                        fontSize: "0.875rem",
                        color: "hsl(var(--muted-foreground))"
                    }}>
                        Вспомнили пароль? <Link to="/login" style={{ color: "hsl(var(--primary))", textDecoration: "none" }}>Войти</Link>
                </p>
                </div>

                {/* Welcome Panel - Right with gradient */}
                <div className={`${styles.welcomePanel} ${styles.rightPanel}`}>
                    <div className={styles.welcomeContent}>
                        <h2 className={styles.welcomeTitle}>
                            Сброс пароля
                        </h2>
                        <p className={styles.welcomeText}>
                            Введите email, указанный при регистрации. Мы отправим ссылку для сброса пароля.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
            await resetPasswordConfirm({ code, password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.message || "Не удалось сбросить пароль.");
        } finally {
            setLoading(false);
        }
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
            <motion.div
                className={styles.formWrapper}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            >
                <h1 className={styles.title}>Новый пароль</h1>
                {success ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={`${styles.status} ${styles.success}`}>
                            Пароль успешно изменен. Перенаправляем на страницу входа...
                        </div>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
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
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0 * 0.08, duration: 0.4 }}
                        >
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 * 0.08, duration: 0.4 }}
                        >
                            <input
                                type="text"
                                placeholder="Код из письма"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className={styles.input}
                                required
                                maxLength={6}
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2 * 0.08, duration: 0.4 }}
                        >
                            <input
                                type="password"
                                placeholder="Новый пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 3 * 0.08, duration: 0.4 }}
                        >
                            <input
                                type="password"
                                placeholder="Подтвердите пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.input}
                                required
                            />
                        </motion.div>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Сохранение..." : "Сохранить пароль"}
                        </Button>
                    </form>
                )}
                <p className={styles.link}>
                    <Link to="/login">Вернуться на страницу входа</Link>
                </p>
            </motion.div>
        </motion.div>
    );
};

export default ResetPassword;

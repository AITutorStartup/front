import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { changePassword } from "@/lib/api";
import styles from "@/features/auth/pages/Auth.module.css";
import SidebarTrigger from "@/components/layout/SidebarTrigger";
import { SidebarProvider } from "@/context/SidebarContext";
import ChatSidebar from "@/features/chat/components/ChatSidebar";

const Profile = () => {
    const [email, setEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
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
            await changePassword({ email, current_password: oldPassword, new_password: newPassword });
            setMessage("Пароль успешно изменен.");
            setOldPassword("");
            setNewPassword("");
        } catch (err: any) {
            setError(err.message || "Не удалось изменить пароль.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <div style={{ display: "flex", height: "100vh", width: "100%" }}>
                <ChatSidebar
                    currentSessionId="1"
                    onSessionChange={() => { }}
                    onNewSession={() => { }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "1rem" }}>
                        <SidebarTrigger />
                    </div>
                    <div className={styles.authContainer} style={{ height: "auto", minHeight: "auto", padding: "2rem" }}>
                        <div className={styles.formWrapper}>
                            <h1 className={styles.title}>Профиль</h1>
                            <h2 className={styles.subtitle} style={{ marginBottom: "1rem" }}>Смена пароля</h2>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                {message && <div className={`${styles.status} ${styles.success}`}>{message}</div>}
                                {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}

                                <input
                                    type="email"
                                    placeholder="Ваш email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Старый пароль"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Новый пароль"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={styles.input}
                                    required
                                />
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Сохранение..." : "Изменить пароль"}
                                </Button>
                            </form>

                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <Button type="button" onClick={() => navigate("/app")} style={{ backgroundColor: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>
                                    Назад к чату
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default Profile;

import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import styles from "@/features/auth/pages/Auth.module.css";
import SidebarTrigger from "@/components/layout/SidebarTrigger";
import { SidebarProvider } from "@/context/SidebarContext";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import { AlertCircle } from "lucide-react";

// TODO: Установить в true когда бэкенд добавит эндпоинт /users/change-password
const CHANGE_PASSWORD_ENABLED = false;

const Profile = () => {
    const navigate = useNavigate();

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

                            {!CHANGE_PASSWORD_ENABLED ? (
                                // Заглушка пока бэкенд не добавит эндпоинт
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "2rem",
                                    backgroundColor: "hsl(var(--muted) / 0.5)",
                                    borderRadius: "var(--radius)",
                                    textAlign: "center"
                                }}>
                                    <AlertCircle style={{ width: "3rem", height: "3rem", color: "hsl(var(--muted-foreground))" }} />
                                    <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
                                        Смена пароля временно недоступна
                                    </h2>
                                    <p style={{ color: "hsl(var(--muted-foreground))", margin: 0, maxWidth: "300px" }}>
                                        Эта функция находится в разработке и скоро будет доступна.
                                    </p>
                                </div>
                            ) : (
                                // Форма смены пароля (будет работать когда бэкенд добавит эндпоинт)
                                <ChangePasswordForm />
                            )}

                            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
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

// Выносим форму в отдельный компонент для чистоты кода
// Будет использоваться когда CHANGE_PASSWORD_ENABLED = true
const ChangePasswordForm = () => {
    const [email, setEmail] = React.useState("");
    const [oldPassword, setOldPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const { changePassword } = await import("@/lib/api");
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
        <>
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
        </>
    );
};

export default Profile;

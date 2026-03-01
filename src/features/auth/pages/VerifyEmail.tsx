import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import { api } from "@/lib/api";
import styles from "./Auth.module.css";

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (cooldown > 0) {
      const timer = window.setTimeout(() => {
        setCooldown((prev) => Math.max(prev - 1, 0));
      }, 1000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  useEffect(() => {
    if (isVerified) {
      const redirectTimer = window.setTimeout(() => {
        navigate("/theory");
      }, 1500);
      return () => window.clearTimeout(redirectTimer);
    }
    return undefined;
  }, [isVerified, navigate]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("Введите email для отправки кода.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    try {
      await api.post("/auth/send-verification/email", { email: email.trim() });
      setStatusMessage("Мы отправили код на вашу почту. Проверьте входящие и спам.");
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.message || "Не удалось отправить код. Попробуйте позже.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setError("Введите 6-значный код из письма.");
      return;
    }
    setError(null);
    setStatusMessage(null);
    try {
      await api.post("/auth/verify-email", { code: code.trim() });
      setStatusMessage("Email успешно подтверждён. Сейчас перенаправим в чат.");
      setIsVerified(true);
      setCode("");
    } catch (err: any) {
      setError(err.message || "Код не подошёл. Попробуйте ещё раз.");
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.splitContainer}>
        {/* Form Panel - Left */}
        <div className={`${styles.formPanel} ${styles.leftPanel}`}>
          <h1 className={styles.title}>Подтвердите почту</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            {statusMessage && (
              <div className={`${styles.status} ${styles.success}`}>{statusMessage}</div>
            )}
            {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}
            
            {!isVerified && (
              <>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="Введите код из письма"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>
                <Button type="submit" disabled={code.trim().length !== 6} className={styles.submitButton}>
                  Подтвердить email
                </Button>
              </>
            )}
          </form>

          {!isVerified && (
            <button 
              type="button" 
              onClick={handleSendCode} 
              disabled={cooldown > 0}
              className={styles.secondaryButton}
            >
              {cooldown > 0 ? `Отправить повторно через ${cooldown}с` : "Отправить код"}
            </button>
          )}
        </div>

        {/* Welcome Panel - Right with gradient */}
        <div className={`${styles.welcomePanel} ${styles.rightPanel}`}>
          <div className={styles.welcomeContent}>
            <h2 className={styles.welcomeTitle}>
              Подтвердите email
            </h2>
            <p className={styles.welcomeText}>
              Мы отправим шестизначный код на email, указанный при регистрации. После подтверждения откроется доступ к обучающим материалам.
            </p>
            {!isVerified && (
              <ul style={{ 
                marginTop: "2rem", 
                paddingLeft: "1.5rem", 
                fontSize: "0.9rem", 
                color: "rgba(255, 255, 255, 0.95)",
                lineHeight: "1.8",
                textAlign: "left",
                maxWidth: "280px"
              }}>
                <li style={{ marginBottom: "0.75rem" }}>Письмо может попасть в папку «Спам» или «Промоакции».</li>
                <li style={{ marginBottom: "0.75rem" }}>Новый код можно запрашивать не чаще одного раза в минуту.</li>
                <li>Если не получается подтвердить почту — напишите нам, поможем.</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/common/Button";
import { api } from "@/lib/api";
import styles from "./Auth.module.css";

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const navigate = useNavigate();

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const result = await api.get<{ is_active: boolean }>("/users/verify_email_status");
      setIsVerified(result.is_active);
      if (result.is_active) {
        setStatusMessage("Email уже подтверждён");
      }
    } catch {
      setIsVerified(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

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
    setError(null);
    setStatusMessage(null);
    try {
      await api.post("/auth/send-verification-code");
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
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Подтвердите почту</h1>

        <p className={styles.subtitle}>
          Мы отправим шестизначный код на email, указанный при регистрации. После подтверждения
          откроется доступ к обучающим материалам.
        </p>

        {loadingStatus && (
          <div className={`${styles.status} ${styles.info}`}>Проверяем статус подтверждения...</div>
        )}
        {statusMessage && (
          <div className={`${styles.status} ${styles.success}`}>{statusMessage}</div>
        )}
        {error && <div className={`${styles.status} ${styles.error}`}>{error}</div>}

        {!isVerified && (
          <div className={styles.actionRow}>
            <Button type="button" onClick={handleSendCode} disabled={cooldown > 0}>
              {cooldown > 0 ? `Отправить повторно через ${cooldown}с` : "Отправить код"}
            </Button>
          </div>
        )}

        {!isVerified && (
          <form onSubmit={handleSubmit} className={styles.form}>
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
            <Button type="submit" disabled={code.trim().length !== 6}>
              Подтвердить email
            </Button>
          </form>
        )}

        <ul className={styles.helperList}>
          <li>Письмо может попасть в папку «Спам» или «Промоакции».</li>
          <li>Новый код можно запрашивать не чаще одного раза в минуту.</li>
          <li>Если не получается подтвердить почту — напишите нам, поможем.</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifyEmail;


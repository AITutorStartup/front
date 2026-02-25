import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import ChatMessage from "@/features/chat/components/ChatMessage";
import ChatInput from "@/features/chat/components/ChatInput";
import TypingIndicator from "@/features/chat/components/TypingIndicator";
import { SidebarProvider } from '@/context/SidebarContext';
import SidebarTrigger from '@/components/layout/SidebarTrigger';
import logoBlack from "@/assets/Logo_black.png";
import { streamGenerate, stopGeneration } from "@/lib/api";
import { useAuth } from "@/features/auth/AuthContext";
import AccountDropdown from "@/components/common/AccountDropdown";
import XpIndicator from "@/features/xp/components/XpIndicator";
import XpToastManager from "@/features/xp/components/XpToastManager";
import { useXp } from "@/features/xp/xpStore";
import styles from "./Index.module.css";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const Theory = () => {
  const [currentSessionId, setCurrentSessionId] = useState("1");
  const mode: 'theory' = 'theory';

  const getWelcomeByMode = () => 'Присылай тему, которую не понял, или вопрос — помогу разобраться.';

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: getWelcomeByMode(), isUser: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isChecking, logout } = useAuth();
  const { awardXp } = useXp();
  const sessionStartTimeRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Track session start for XP
  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    return () => {
      if (sessionStartTimeRef.current) {
        const duration = (Date.now() - sessionStartTimeRef.current) / 1000 / 60;
        if (duration >= 5) {
          awardXp("session_finished", { sessionDuration: duration });
        }
      }
    };
  }, [awardXp]);

  // Cancel stream when tab becomes hidden or component unmounts
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden && abortControllerRef.current) {
        // Tab became hidden, cancel the stream
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsTyping(false);
        try {
          await stopGeneration();
        } catch (e) {
          console.error("Failed to stop generation on visibility change:", e);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Cancel stream on component unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsTyping(false);
        // Try to stop generation on backend, but don't await to avoid blocking unmount
        stopGeneration().catch((e) => {
          console.error("Failed to stop generation on unmount:", e);
        });
      }
    };
  }, []);

  const handleSendMessage = async (content: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newMessage: Message = { id: Date.now().toString(), content, isUser: true };
    setMessages((prev) => [...prev, newMessage]);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = { id: aiMessageId, content: "", isUser: false };
    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(true);

    abortControllerRef.current = new AbortController();
    let accumulatedText = "";

    try {
      await streamGenerate(
        content,
        (delta) => {
          accumulatedText += delta;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: accumulatedText } : msg
            )
          );
        },
        (meta) => console.log("Meta:", meta),
        () => {
          setIsTyping(false);
          abortControllerRef.current = null;
          // Award XP for reading explanation
          awardXp("explain_read", { messageId: aiMessageId });
        },
        (error) => {
          console.error("Stream error:", error);
          setIsTyping(false);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? {
                    ...msg,
                    content:
                      error.name === "AbortError"
                        ? "Запрос прерван пользователем."
                        : `Ошибка: ${error.message}`,
                  }
                : msg
            )
          );
          abortControllerRef.current = null;
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      console.error("Error in streamGenerate:", error);
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
      try {
        await stopGeneration();
      } catch (e) {
        console.error("Failed to stop generation:", e);
      }
    }
  };

  const handleNewSession = () => {
    setMessages([{ id: "1", content: getWelcomeByMode(), isUser: false }]);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderAuthActions = () => {
    if (isChecking) {
      return (
        <span className={styles.authLink} style={{ cursor: "default" }}>
          ...
        </span>
      );
    }

    if (!isAuthenticated) {
      return (
        <>
          <Link to="/login" className={styles.authLink}>Войти</Link>
          <Link to="/register" className={styles.authLink}>Регистрация</Link>
        </>
      );
    }

    return (
      <>
        <AccountDropdown />
        <button type="button" onClick={handleLogout} className={styles.authLink}>Выйти</button>
      </>
    );
  };

  return (
    <SidebarProvider>
      <div className={styles.pageWrapper}>
        <ChatSidebar
          currentSessionId={currentSessionId}
          onSessionChange={setCurrentSessionId}
          onNewSession={handleNewSession}
        />
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerTitle}>
                <SidebarTrigger />
                <img src={logoBlack} alt="T-ASK" className={styles.headerLogo} />
              </div>
              <div className={styles.headerActions}>
                <XpIndicator />
                <nav className={styles.modeNav} aria-label="Режим">
                  <div className={`${styles.modeGroup} ${styles.isTheory}`} role="tablist">
                    <span className={styles.modeSlider} aria-hidden="true" />
                    <Link to="/theory" role="tab" aria-selected className={`${styles.modeLink} ${styles.modeLinkActive}`}>Теория</Link>
                    <Link to="/practice" role="tab" aria-selected={false} className={styles.modeLink}>Практика</Link>
                  </div>
                </nav>
                <div className={styles.authLinks}>{renderAuthActions()}</div>
              </div>
            </div>
          </header>
          <main className={styles.chatArea}>
            <div className={styles.chatContainer}>
              <div className={styles.messagesContainer}>
                <div className={styles.messagesList}>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} content={message.content} isUser={message.isUser} />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <ChatInput 
                onSend={handleSendMessage} 
                disabled={isTyping}
                onCancel={handleCancel}
                showCancel={isTyping}
              />
            </div>
          </main>
        </div>
        <XpToastManager />
      </div>
    </SidebarProvider>
  );
};

export default Theory;



import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { SidebarProvider } from '@/context/SidebarContext';
import SidebarTrigger from '@/components/layout/SidebarTrigger';
import { GraduationCap } from "lucide-react";
import { streamGenerate } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import styles from "./Index.module.css";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const Practice = () => {
  const [currentSessionId, setCurrentSessionId] = useState("1");
  const mode: 'practice' = 'practice';

  const getWelcomeByMode = () => 'Готов решить пару задач по пройденной теме.';

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: getWelcomeByMode(), isUser: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isChecking, logout } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

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

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
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
        <Link to="/verify-email" className={styles.authLink}>Аккаунт</Link>
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
            <div className={styles.headerTitle}>
              <SidebarTrigger />
              <div className={styles.headerIconWrapper}>
                <GraduationCap className={styles.headerIcon} />
              </div>
              <h1 className={styles.headerText}>AI Репетитор</h1>
            </div>
            <div className={styles.authLinks}>{renderAuthActions()}</div>
          </header>
          <nav className={styles.topModeBar} aria-label="Режим">
            <div className={`${styles.topModeGroup} ${styles.isPractice}`} role="tablist">
              <span className={styles.modeSlider} aria-hidden="true" />
              <Link to="/theory" role="tab" aria-selected={false} className={styles.modeLink}>Теория</Link>
              <Link to="/practice" role="tab" aria-selected className={`${styles.modeLink} ${styles.modeLinkActive}`}>Практика</Link>
            </div>
          </nav>
          <main className={styles.chatArea}>
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Practice;



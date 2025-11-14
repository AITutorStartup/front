import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import { SidebarProvider } from '@/context/SidebarContext';
import SidebarTrigger from '@/components/common/SidebarTrigger';
import { GraduationCap } from "lucide-react";
import { streamGenerate } from "@/lib/api";
import styles from "./Index.module.css";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
}

const Index = () => {
  const [currentSessionId, setCurrentSessionId] = useState("1");

  const [mode, setMode] = useState<'theory' | 'practice'>('theory');

  const getWelcomeByMode = (m: 'theory' | 'practice') =>
    m === 'theory'
      ? 'Присылай тему, которую не понял, или вопрос — помогу разобраться.'
      : 'Готов решить пару задач по пройденной теме.';

  const getActionMessage = (action: string, m: 'theory' | 'practice') => {
    if (action === 'check') return 'Я хочу проверить своё решение';
    if (m === 'theory') {
      if (action === 'explain') return 'Объясни мне текущую тему подробно';
      if (action === 'task') return 'Дай небольшой пример для иллюстрации';
    } else {
      if (action === 'explain') return 'Короткая подсказка по теме';
      if (action === 'task') return 'Дай мне задание для практики';
    }
    return 'Понял твой запрос';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: getWelcomeByMode(mode),
      isUser: false,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Sync mode with URL: /practice -> 'practice', otherwise 'theory'
  useEffect(() => {
    if (location.pathname.includes('/practice')) {
      setMode('practice');
    } else if (location.pathname.includes('/theory') || location.pathname === '/app') {
      setMode('theory');
    }
  }, [location.pathname]);

  const handleSendMessage = async (content: string) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Create AI response message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      isUser: false,
    };
    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(true);

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    let accumulatedText = "";

    try {
      await streamGenerate(
        content,
        (delta) => {
          accumulatedText += delta;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: accumulatedText }
                : msg
            )
          );
        },
        (meta) => {
          console.log("Meta:", meta);
        },
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

  // Быстрые действия удалены из интерфейса

  const handleNewSession = () => {
    setMessages([
      {
        id: "1",
        content: getWelcomeByMode(mode),
        isUser: false,
      },
    ]);
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
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.authLink}>
                Войти
              </Link>
              <Link to="/register" className={styles.authLink}>
                Регистрация
              </Link>
            </div>
          </header>
          <nav className={styles.topModeBar} aria-label="Режим">
            <div
              className={`${styles.topModeGroup} ${mode === 'theory' ? styles.isTheory : styles.isPractice}`}
              role="tablist"
            >
              <span className={styles.modeSlider} aria-hidden="true" />
              <Link
                to="/theory"
                role="tab"
                aria-selected={mode === 'theory'}
                className={`${styles.modeLink} ${mode === 'theory' ? styles.modeLinkActive : ''}`}
              >
                Теория
              </Link>
              <Link
                to="/practice"
                role="tab"
                aria-selected={mode === 'practice'}
                className={`${styles.modeLink} ${mode === 'practice' ? styles.modeLinkActive : ''}`}
              >
                Практика
              </Link>
            </div>
          </nav>
          <main className={styles.chatArea}>
            <div className={styles.messagesContainer}>
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    content={message.content}
                    isUser={message.isUser}
                  />
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

export default Index;

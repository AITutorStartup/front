import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import { SidebarProvider } from '@/context/SidebarContext';
import SidebarTrigger from '@/components/common/SidebarTrigger';
import { GraduationCap } from "lucide-react";
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
    } else if (location.pathname.includes('/theory') || location.pathname === '/') {
      setMode('theory');
    }
  }, [location.pathname]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let response = '';
      if (userMessage.toLowerCase().includes('квадратн')) {
        response =
          mode === 'theory'
            ? 'Теория: Квадратное уравнение имеет вид: ax^2 + bx + c = 0. Дискриминант D = b^2 - 4ac ...'
            : 'Практика: Реши уравнение 2x^2 - 3x - 2 = 0. Попробуй формулу дискриминанта. Напиши шаги.';
      } else {
        response =
          mode === 'theory'
            ? 'Давай разберёмся теоретически: сформулируй, что именно непонятно, и я распишу по пунктам.'
            : 'Готов дать практику: хочешь задачу базового или повышенного уровня?';
      }
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), content: response, isUser: false },
      ]);
    }, 1500);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    simulateAIResponse(content);
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
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

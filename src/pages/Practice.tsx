import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
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

const Practice = () => {
  const [currentSessionId, setCurrentSessionId] = useState("1");
  const mode: 'practice' = 'practice';

  const getWelcomeByMode = () => 'Готов решить пару задач по пройденной теме.';

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: getWelcomeByMode(), isUser: false },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let response = '';
      if (userMessage.toLowerCase().includes('квадратн')) {
        response = 'Практика: Реши уравнение 2x^2 - 3x - 2 = 0. Попробуй формулу дискриминанта. Напиши шаги.';
      } else {
        response = 'Готов дать практику: хочешь задачу базового или повышенного уровня?';
      }
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: Date.now().toString(), content: response, isUser: false }]);
    }, 1500);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = { id: Date.now().toString(), content, isUser: true };
    setMessages((prev) => [...prev, newMessage]);
    simulateAIResponse(content);
  };

  const handleNewSession = () => {
    setMessages([{ id: "1", content: getWelcomeByMode(), isUser: false }]);
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
              <Link to="/login" className={styles.authLink}>Войти</Link>
              <Link to="/register" className={styles.authLink}>Регистрация</Link>
            </div>
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
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Practice;



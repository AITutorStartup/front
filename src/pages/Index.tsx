import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatSidebar from "@/components/ChatSidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import QuickActions from "@/components/QuickActions";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Привет! Я твой AI-репетитор. Готов помочь с любыми учебными вопросами. Чем могу быть полезен?",
      isUser: false,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      let response = "";
      if (userMessage.toLowerCase().includes("квадратн")) {
        response = `Квадратное уравнение имеет вид: $ax^2 + bx + c = 0$ ...`; // и так далее
      } else {
        response = `Понял твой вопрос! ...`; // и так далее
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

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      explain: "Объясни мне текущую тему подробно",
      task: "Дай мне задание для практики",
      check: "Я хочу проверить своё решение",
    };
    handleSendMessage(actionMessages[action]);
  };

  const handleNewSession = () => {
    setMessages([
      {
        id: "1",
        content: "Новая сессия начата! Чем могу помочь?",
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
            <QuickActions onAction={handleQuickAction} disabled={isTyping} />
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;

// src/pages/Index.tsx

import { useState, useRef, useEffect } from "react";
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
        response = `Квадратное уравнение имеет вид: $ax^2 + bx + c = 0$

Для решения используем формулу дискриминанта:

$D = b^2 - 4ac$

Если $D > 0$, у уравнения два корня:
- $x_1 = \\frac{-b + \\sqrt{D}}{2a}$
- $x_2 = \\frac{-b - \\sqrt{D}}{2a}$

Если $D = 0$, один корень: $x = \\frac{-b}{2a}$

Если $D < 0$, корней нет (в действительных числах).

Хочешь разобрать конкретный пример?`;
      } else if (userMessage.toLowerCase().includes("задани")) {
        response = `Отлично! Вот задание для тренировки:

**Задача:** Реши квадратное уравнение $2x^2 - 5x + 2 = 0$

**Шаги:**
1. Определи коэффициенты $a$, $b$, $c$
2. Вычисли дискриминант $D$
3. Найди корни уравнения

Попробуй решить самостоятельно, а потом я проверю твой ответ!`;
      } else if (userMessage.toLowerCase().includes("провер")) {
        response = `Конечно, с удовольствием проверю твоё решение! 

Пожалуйста, пришли:
1. Условие задачи
2. Твой ход решения
3. Полученный ответ

Я подробно разберу каждый шаг и укажу на ошибки, если они есть.`;
      } else {
        response = `Понял твой вопрос! 

Я могу помочь с:
- 📚 Объяснением любых тем
- ✍️ Решением задач
- 🔍 Проверкой твоих решений
- 💡 Подсказками и примерами

Используй кнопки быстрых действий внизу или просто напиши, что тебе нужно!`;
      }

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: response,
          isUser: false,
        },
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
            <SidebarTrigger />
            <div className={styles.headerTitle}>
              <div className={styles.headerIconWrapper}>
                <GraduationCap className={styles.headerIcon} />
              </div>
              <h1 className={styles.headerText}>AI Репетитор</h1>
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

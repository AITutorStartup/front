/**
 * Chat Index Page - Premium Redesign
 * 
 * LAYOUT STRUCTURE (inspired by design references):
 * - Vertical column layout with strong typographic hierarchy (ref 1)
 * - Soft glassmorphism panels with subtle blur effects (ref 2)
 * - Bold central typography with minimal navigation (ref 3)
 * - Clean dashboard cards with soft shadows and rounded panels (ref 4)
 * 
 * DESIGN PRINCIPLES APPLIED:
 * 1. Split layout: Main conversation panel with optional context sidebar
 * 2. Big typography: Large, readable text with generous whitespace
 * 3. Glassmorphism: Subtle backdrop blur and translucent panels
 * 4. Rounded cards: 8-16px radius for message bubbles and containers
 * 5. Soft shadows: Delicate elevation for depth without heaviness
 * 6. Minimal controls: Pill-shaped buttons, icon-only secondary actions
 * 
 * FUNCTIONALITY PRESERVED:
 * - All existing API calls and message streaming logic
 * - State management and session handling
 * - Authentication and routing flows
 * - All props and component interfaces remain unchanged
 */

import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  const navigate = useNavigate();
  const { isAuthenticated, isChecking, logout } = useAuth();
  const { awardXp } = useXp();
  const sessionStartTimeRef = useRef<number | null>(null);

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

  // Track session start for XP
  useEffect(() => {
    sessionStartTimeRef.current = Date.now();
    return () => {
      // Award session_finished XP when component unmounts (session ends)
      if (sessionStartTimeRef.current) {
        const duration = (Date.now() - sessionStartTimeRef.current) / 1000 / 60; // minutes
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
        undefined,
        () => {
          setIsTyping(false);
          abortControllerRef.current = null;
          // Award XP for task solved (when AI responds)
          if (mode === 'practice') {
            awardXp("task_solved", { taskId: aiMessageId, mode });
          }
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
    setMessages([
      {
        id: "1",
        content: getWelcomeByMode(mode),
        isUser: false,
      },
    ]);
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
          <Link to="/login" className={styles.authLink}>
            Войти
          </Link>
          <Link to="/register" className={styles.authLink}>
            Регистрация
          </Link>
        </>
      );
    }

    return <AccountDropdown onLogout={handleLogout} />;
  };

  return (
    <SidebarProvider>
      <motion.div
        className={styles.pageWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <ChatSidebar
          currentSessionId={currentSessionId}
          onSessionChange={setCurrentSessionId}
          onNewSession={handleNewSession}
        />
        <div className={styles.mainContent}>
          <motion.header
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className={styles.headerContent}>
              <div className={styles.headerTitle}>
                <SidebarTrigger />
                <img src={logoBlack} alt="T-ASK" className={styles.headerLogo} />
              </div>
              <div className={styles.headerActions}>
                <XpIndicator />
                <nav className={styles.modeNav} aria-label="Режим">
                  <div
                    className={`${styles.modeGroup} ${mode === 'theory' ? styles.isTheory : styles.isPractice}`}
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
                <div className={styles.authLinks}>{renderAuthActions()}</div>
              </div>
            </div>
          </motion.header>
          <main className={styles.chatArea}>
            <div className={styles.chatContainer}>
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
            </div>
          </main>
        </div>
        <XpToastManager />
      </motion.div>
    </SidebarProvider>
  );
};

export default Index;

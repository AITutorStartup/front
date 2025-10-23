// src/components/ChatSidebar.tsx

import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext"; // 1. Импортируем наш хук
import styles from "./ChatSidebar.module.css";

interface Session {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
}

const ChatSidebar = ({
  currentSessionId,
  onSessionChange,
  onNewSession,
}: ChatSidebarProps) => {
  const { isOpen } = useSidebar(); // 2. Получаем состояние сайдбара
  const [sessions] = useState<Session[]>([
    {
      id: "1",
      title: "Математика: Квадратные уравнения",
      preview: "Объясни как решать...",
      timestamp: new Date(),
    },
    {
      id: "2",
      title: "Физика: Законы Ньютона",
      preview: "Дай задание на...",
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: "3",
      title: "Химия: Органические соединения",
      preview: "Проверь решение...",
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);

  // Утилита для условного объединения классов
  const combineClasses = (...classNames: (string | boolean | undefined)[]) => {
    return classNames.filter(Boolean).join(" ");
  };

  // 3. Если сайдбар закрыт, мы ничего не рендерим
  if (!isOpen) {
    return null;
  }

  // 4. Если открыт - рендерим как и раньше, но уже с новыми стилями
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <button onClick={onNewSession} className={styles.newChatButton}>
          <Plus className={styles.newChatIcon} />
          Новый чат
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.groupLabel}>История сессий</div>
        <ul className={styles.menu}>
          {sessions.map((session) => (
            <li key={session.id}>
              <button
                onClick={() => onSessionChange(session.id)}
                className={combineClasses(
                  styles.menuButton,
                  currentSessionId === session.id && styles.menuButtonActive
                )}
              >
                <MessageSquare className={styles.sessionIcon} />
                <div className={styles.textWrapper}>
                  <div className={styles.title}>{session.title}</div>
                  <div className={styles.preview}>{session.preview}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ChatSidebar;

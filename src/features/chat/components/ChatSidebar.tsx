
import { useState, useEffect } from "react";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { getChatHistory } from "@/lib/api";
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
  const { isOpen } = useSidebar();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем историю чатов с бэкенда
  useEffect(() => {
    if (!isOpen) return;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getChatHistory();
        // TODO: Адаптировать формат ответа API к интерфейсу Session
        // Предполагаемый формат ответа: массив объектов с полями id, title/name, preview/lastMessage, timestamp/createdAt
        if (Array.isArray(data)) {
          const mapped: Session[] = data.map((item: any, index: number) => ({
            id: item.id || item.chat_id || String(index + 1),
            title: item.title || item.name || `Чат ${index + 1}`,
            preview: item.preview || item.last_message || item.lastMessage || "",
            timestamp: item.timestamp || item.created_at || item.createdAt
              ? new Date(item.timestamp || item.created_at || item.createdAt)
              : new Date(),
          }));
          setSessions(mapped);
        } else {
          // Если API вернул не массив, показываем пустую историю
          setSessions([]);
        }
      } catch (err: any) {
        console.error("Не удалось загрузить историю чатов:", err);
        setError("Не удалось загрузить историю");
        // Fallback: показываем пустой список
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [isOpen]);

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
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} />
            <span>Загрузка...</span>
          </div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : sessions.length === 0 ? (
          <div className={styles.emptyState}>Нет истории чатов</div>
        ) : (
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
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider } from "@/context/SidebarContext";
import SidebarTrigger from "@/components/layout/SidebarTrigger";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import { Trophy, Clock } from "lucide-react";
import { getLeaderboard, getTimeRemainingInWeek } from "@/features/leaderboard/leaderboardApi";
import LeaderboardList from "@/features/leaderboard/components/LeaderboardList";
import styles from "./Leaderboard.module.css";

export default function Leaderboard() {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [currentSessionId] = useState("1");

  const { data, isLoading, error } = useQuery({
    queryKey: ["leaderboard", period],
    queryFn: () => getLeaderboard(period),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const timeRemaining = getTimeRemainingInWeek();

  return (
    <SidebarProvider>
      <div className={styles.pageWrapper}>
        <ChatSidebar
          currentSessionId={currentSessionId}
          onSessionChange={() => {}}
          onNewSession={() => {}}
        />
        <div className={styles.mainContent}>
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerTitle}>
                <SidebarTrigger />
                <div className={styles.headerIconWrapper}>
                  <Trophy className={styles.headerIcon} />
                </div>
                <h1 className={styles.headerText}>Таблица лидеров</h1>
              </div>
              <div className={styles.headerActions}>
                <Link to="/app" className={styles.backLink}>
                  К чату
                </Link>
              </div>
            </div>
          </header>

          <main className={styles.content}>
            {/* Period selector */}
            <div className={styles.periodSelector}>
              <button
                className={`${styles.periodButton} ${
                  period === "week" ? styles.active : ""
                }`}
                onClick={() => setPeriod("week")}
              >
                Неделя
              </button>
              <button
                className={`${styles.periodButton} ${
                  period === "month" ? styles.active : ""
                }`}
                onClick={() => setPeriod("month")}
                disabled
                title="Скоро"
              >
                Месяц
              </button>
            </div>

            {/* Time remaining */}
            {period === "week" && (
              <div className={styles.timeRemaining}>
                <Clock className={styles.clockIcon} />
                <span>
                  До конца недели:{" "}
                  {timeRemaining.days > 0 && `${timeRemaining.days}д `}
                  {timeRemaining.hours}ч {timeRemaining.minutes}м
                </span>
              </div>
            )}

            {/* Leaderboard content */}
            <div className={styles.leaderboardCard}>
              {error && (
                <div className={styles.error}>
                  Ошибка загрузки таблицы лидеров. Попробуйте обновить страницу.
                </div>
              )}

              {data && (
                <LeaderboardList
                  entries={data.entries}
                  myEntry={data.myEntry}
                  isLoading={isLoading}
                />
              )}

              {isLoading && !data && (
                <LeaderboardList
                  entries={[]}
                  myEntry={{
                    userId: "user-123",
                    displayName: "Вы",
                    weeklyXp: 0,
                    rank: 0,
                  }}
                  isLoading
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


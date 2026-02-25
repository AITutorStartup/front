import { useState } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/context/SidebarContext";
import SidebarTrigger from "@/components/layout/SidebarTrigger";
import ChatSidebar from "@/features/chat/components/ChatSidebar";
import { Target, Clock, TrendingUp } from "lucide-react";
import logoBlack from "@/assets/Logo_black.png";
import { useStudyDashboard } from "@/features/study/hooks/useStudyDashboard";
import KpiCard from "@/features/study/components/KpiCard";
import WeeklyActivityChart from "@/features/study/components/WeeklyActivityChart";
import TopicProgressList from "@/features/study/components/TopicProgressList";
import RecentActivityList from "@/features/study/components/RecentActivityList";
import styles from "./StudyDashboard.module.css";

export default function StudyDashboard() {
  const [currentSessionId] = useState("1");
  const { data, isLoading, error } = useStudyDashboard();
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className={styles.pageWrapper}>
          <div className={styles.loading}>Загрузка...</div>
        </div>
      </SidebarProvider>
    );
  }

  if (error || !data) {
    return (
      <SidebarProvider>
        <div className={styles.pageWrapper}>
          <div className={styles.error}>
            Ошибка загрузки данных. Попробуйте обновить страницу.
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const todayStatus = `Сегодня: ${data.today.tasksSolved} задач - ${formatTime(data.today.timeSpent)}`;

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
                <img src={logoBlack} alt="T-ASK" className={styles.headerLogo} />
                <p className={styles.headerSubtitle}>{todayStatus}</p>
              </div>
              <div className={styles.headerActions}>
                <div className={styles.timeRangeSelector}>
                  <button
                    className={`${styles.timeRangeButton} ${
                      timeRange === "7d" ? styles.active : ""
                    }`}
                    onClick={() => setTimeRange("7d")}
                  >
                    7д
                  </button>
                  <button
                    className={`${styles.timeRangeButton} ${
                      timeRange === "30d" ? styles.active : ""
                    }`}
                    onClick={() => setTimeRange("30d")}
                  >
                    30д
                  </button>
                </div>
                <Link to="/app" className={styles.backLink}>
                  К чату
                </Link>
              </div>
            </div>
          </header>

          <main className={styles.content}>
            {/* KPI Cards */}
            <div className={styles.kpiGrid}>
              <KpiCard
                title="Решено задач"
                value={`${data.today.tasksSolved}`}
                subtitle={`Всего: ${data.totals.tasksSolved}`}
                icon={<Target className={styles.kpiIcon} />}
                gradient="primary"
              />
              <KpiCard
                title="Серия"
                value={`${data.streak.current} дн`}
                subtitle={`Рекорд: ${data.streak.longest} дн`}
                icon={<TrendingUp className={styles.kpiIcon} />}
                gradient="success"
                trend={{
                  value: `+${data.streak.current} дн`,
                  isPositive: true,
                }}
              />
              <KpiCard
                title="Точность"
                value={`${data.totals.accuracy}%`}
                subtitle="Средний показатель"
                icon={<Target className={styles.kpiIcon} />}
                gradient="accent"
              />
              <KpiCard
                title="Время"
                value={formatTime(data.totals.timeSpent)}
                subtitle={`Сегодня: ${formatTime(data.today.timeSpent)}`}
                icon={<Clock className={styles.kpiIcon} />}
                gradient="warning"
              />
            </div>

            {/* Activity Chart */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Активность за неделю</h2>
              </div>
              <div className={styles.cardContent}>
                <WeeklyActivityChart data={data.weeklyActivity} />
              </div>
            </div>

            {/* Topics and Recent Activity Grid */}
            <div className={styles.grid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Прогресс по темам</h2>
                </div>
                <div className={styles.cardContent}>
                  <TopicProgressList
                    topics={data.topics}
                    weakAreas={data.weakAreas}
                  />
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Недавняя активность</h2>
                </div>
                <div className={styles.cardContent}>
                  <RecentActivityList activities={data.recent} />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}


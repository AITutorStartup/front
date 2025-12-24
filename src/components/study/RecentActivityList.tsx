import styles from "./RecentActivityList.module.css";
import { RecentActivity } from "@/lib/mockStudyDashboard";
import { CheckCircle2, XCircle } from "lucide-react";

interface RecentActivityListProps {
  activities: RecentActivity[];
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} мин назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ч назад`;
  } else {
    return `${diffDays} дн назад`;
  }
}

export default function RecentActivityList({
  activities,
}: RecentActivityListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.item}>
            <div className={styles.icon}>
              {activity.result === "correct" ? (
                <CheckCircle2 className={styles.iconCorrect} />
              ) : (
                <XCircle className={styles.iconIncorrect} />
              )}
            </div>
            <div className={styles.content}>
              <div className={styles.header}>
                <span className={styles.topic}>{activity.topic}</span>
                <span className={styles.time}>{formatTimeAgo(activity.timestamp)}</span>
              </div>
              <div className={styles.taskType}>{activity.taskType}</div>
              <div className={styles.meta}>
                <span className={styles.timeSpent}>
                  {activity.timeSpent} мин
                </span>
                <span
                  className={`${styles.result} ${
                    activity.result === "correct"
                      ? styles.resultCorrect
                      : styles.resultIncorrect
                  }`}
                >
                  {activity.result === "correct" ? "Правильно" : "Неправильно"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


import styles from "./WeeklyActivityChart.module.css";
import { WeeklyActivity } from "@/features/study/lib/mockStudyDashboard";

interface WeeklyActivityChartProps {
  data: WeeklyActivity[];
}

export default function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const maxTasks = Math.max(...data.map((d) => d.tasks), 1);

  return (
    <div className={styles.chart}>
      <div className={styles.bars}>
        {data.map((day, index) => {
          const height = (day.tasks / maxTasks) * 100;
          return (
            <div key={index} className={styles.barGroup}>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{ height: `${height}%` }}
                  title={`${day.tasks} задач, ${day.timeSpent} мин`}
                />
              </div>
              <div className={styles.label}>{day.day}</div>
            </div>
          );
        })}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot}></span>
          <span>Задачи</span>
        </div>
      </div>
    </div>
  );
}


import styles from "./TopicProgressList.module.css";
import { TopicProgress } from "@/features/study/lib/mockStudyDashboard";

interface TopicProgressListProps {
  topics: TopicProgress[];
  weakAreas?: string[];
}

export default function TopicProgressList({
  topics,
  weakAreas = [],
}: TopicProgressListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {topics.map((topic) => {
          const isWeakArea = weakAreas.includes(topic.name);
          return (
            <div
              key={topic.id}
              className={`${styles.item} ${isWeakArea ? styles.weakArea : ""}`}
            >
              <div className={styles.header}>
                <div className={styles.topicInfo}>
                  <h4 className={styles.topicName}>{topic.name}</h4>
                  <span className={styles.stats}>
                    {topic.tasksCompleted}/{topic.tasksTotal} задач
                  </span>
                </div>
                <div className={styles.accuracy}>
                  <span className={styles.accuracyLabel}>Точность</span>
                  <span className={styles.accuracyValue}>{topic.accuracy}%</span>
                </div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${topic.progress}%` }}
                />
              </div>
              <div className={styles.progressText}>
                <span>{topic.progress}% завершено</span>
              </div>
            </div>
          );
        })}
      </div>
      {weakAreas.length > 0 && (
        <div className={styles.weakAreasCard}>
          <h4 className={styles.weakAreasTitle}>Слабое место</h4>
          <p className={styles.weakAreasText}>
            Сосредоточьтесь на: <strong>{weakAreas.join(", ")}</strong>
          </p>
        </div>
      )}
    </div>
  );
}


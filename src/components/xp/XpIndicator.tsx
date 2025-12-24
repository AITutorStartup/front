import { useXp } from "@/features/xp/xpStore";
import { calculateLevelProgress } from "@/features/xp/xpRules";
import { Trophy, Zap } from "lucide-react";
import styles from "./XpIndicator.module.css";

export default function XpIndicator() {
  const { summary } = useXp();
  const progress = calculateLevelProgress(summary.totalXp);

  return (
    <div className={styles.indicator}>
      <div className={styles.levelBadge}>
        <Trophy className={styles.icon} />
        <span className={styles.level}>{progress.level}</span>
      </div>
      <div className={styles.xpInfo}>
        <div className={styles.weeklyXp}>
          <Zap className={styles.xpIcon} />
          <span className={styles.xpValue}>{summary.weeklyXp}</span>
          <span className={styles.xpLabel}>XP</span>
        </div>
        {progress.xpToNextLevel > 0 && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress.progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


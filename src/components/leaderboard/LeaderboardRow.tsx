import { LeaderboardEntry } from "@/features/xp/types";
import { Medal } from "lucide-react";
import styles from "./LeaderboardRow.module.css";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  isTopThree?: boolean;
}

export default function LeaderboardRow({
  entry,
  isCurrentUser = false,
  isTopThree = false,
}: LeaderboardRowProps) {
  const getMedalColor = () => {
    switch (entry.rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return undefined;
    }
  };

  return (
    <div
      className={`${styles.row} ${isCurrentUser ? styles.currentUser : ""} ${
        isTopThree ? styles.topThree : ""
      }`}
    >
      <div className={styles.rankSection}>
        {isTopThree ? (
          <Medal className={styles.medal} style={{ color: getMedalColor() }} />
        ) : (
          <span className={styles.rank}>{entry.rank}</span>
        )}
      </div>
      <div className={styles.userSection}>
        <div className={styles.avatar}>
          {entry.avatarUrl ? (
            <img src={entry.avatarUrl} alt={entry.displayName} />
          ) : (
            <span className={styles.avatarPlaceholder}>
              {entry.displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className={styles.name}>{entry.displayName}</span>
        {isCurrentUser && <span className={styles.youBadge}>Вы</span>}
      </div>
      <div className={styles.xpSection}>
        <span className={styles.xpValue}>{entry.weeklyXp}</span>
        <span className={styles.xpLabel}>XP</span>
      </div>
    </div>
  );
}



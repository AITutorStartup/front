import { LeaderboardEntry } from "@/features/xp/types";
import LeaderboardRow from "./LeaderboardRow";
import styles from "./LeaderboardList.module.css";

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  myEntry: LeaderboardEntry;
  isLoading?: boolean;
}

export default function LeaderboardList({
  entries,
  myEntry,
  isLoading = false,
}: LeaderboardListProps) {
  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={styles.skeletonRow}>
            <div className={styles.skeletonRank} />
            <div className={styles.skeletonAvatar} />
            <div className={styles.skeletonName} />
            <div className={styles.skeletonXp} />
          </div>
        ))}
      </div>
    );
  }

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);
  const isMyEntryInTop = topThree.some((e) => e.userId === myEntry.userId);
  const isMyEntryInRest = rest.some((e) => e.userId === myEntry.userId);

  return (
    <div className={styles.list}>
      {/* Top 3 */}
      {topThree.length > 0 && (
        <div className={styles.topThreeSection}>
          {topThree.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === myEntry.userId}
              isTopThree
            />
          ))}
        </div>
      )}

      {/* Rest of entries */}
      {rest.length > 0 && (
        <div className={styles.restSection}>
          {rest.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === myEntry.userId}
            />
          ))}
        </div>
      )}

      {/* Show "Your position" if user is not in visible area */}
      {!isMyEntryInTop && !isMyEntryInRest && (
        <div className={styles.myPositionSticky}>
          <div className={styles.stickyDivider} />
          <LeaderboardRow entry={myEntry} isCurrentUser />
        </div>
      )}
    </div>
  );
}



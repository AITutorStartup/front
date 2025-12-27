/**
 * Leaderboard API Client
 * 
 * Provides functions to fetch leaderboard data.
 * Currently uses mock data, but structured to easily swap to real API calls.
 */

import { LeaderboardResponse, LeaderboardEntry } from "../xp/types";

const MOCK_USER_ID = "user-123";
const MOCK_USER_NAME = "Вы";

// Deterministic random generator (seeded)
let seed = 12345;
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Generate mock user data
function generateMockUsers(count: number): LeaderboardEntry[] {
  const users: LeaderboardEntry[] = [];
  const names = [
    "Алексей",
    "Мария",
    "Дмитрий",
    "Анна",
    "Иван",
    "Елена",
    "Сергей",
    "Ольга",
    "Андрей",
    "Наталья",
    "Павел",
    "Юлия",
    "Михаил",
    "Татьяна",
    "Владимир",
    "Екатерина",
    "Николай",
    "Ирина",
    "Александр",
    "Светлана",
    "Максим",
    "Виктория",
    "Артем",
    "Дарья",
    "Роман",
    "Анастасия",
    "Игорь",
    "Марина",
    "Олег",
    "Полина",
  ];

  for (let i = 0; i < count; i++) {
    const weeklyXp = Math.floor(seededRandom() * 500) + 10; // 10-510 XP
    users.push({
      userId: `user-${i}`,
      displayName: names[i % names.length] + (i > names.length ? ` ${Math.floor(i / names.length) + 1}` : ""),
      avatarUrl: undefined,
      weeklyXp,
      rank: i + 1,
    });
  }

  // Sort by weekly XP descending
  users.sort((a, b) => b.weeklyXp - a.weeklyXp);

  // Assign ranks
  users.forEach((user, index) => {
    user.rank = index + 1;
  });

  return users;
}

/**
 * Get start and end of current week (Monday to Sunday)
 */
function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Get leaderboard for a period
 * 
 * In real implementation, this would GET /api/leaderboard?period=week
 */
export async function getLeaderboard(
  period: "week" | "month" = "week"
): Promise<LeaderboardResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 300));

  const { start, end } = getWeekBounds();
  const allUsers = generateMockUsers(50 + Math.floor(seededRandom() * 50)); // 50-100 users

  // Find or create current user entry
  let myEntry = allUsers.find((u) => u.userId === MOCK_USER_ID);
  if (!myEntry) {
    // Current user not in top, create entry
    const myWeeklyXp = Math.floor(seededRandom() * 200) + 5;
    const myRank = allUsers.filter((u) => u.weeklyXp > myWeeklyXp).length + 1;

    myEntry = {
      userId: MOCK_USER_ID,
      displayName: MOCK_USER_NAME,
      avatarUrl: undefined,
      weeklyXp: myWeeklyXp,
      rank: myRank,
    };

    // Insert in correct position
    allUsers.splice(myRank - 1, 0, myEntry);
    // Reassign ranks
    allUsers.forEach((user, index) => {
      user.rank = index + 1;
    });
  }

  // Take top 50 for display
  const topEntries = allUsers.slice(0, 50);

  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
    myEntry,
    entries: topEntries,
  };
}

/**
 * Calculate time remaining in week
 */
export function getTimeRemainingInWeek(): {
  days: number;
  hours: number;
  minutes: number;
} {
  const { end } = getWeekBounds();
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}



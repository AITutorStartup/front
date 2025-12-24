/**
 * XP System Types
 * 
 * These types represent the data contracts for the XP system.
 * They are designed to match future backend API responses and requests.
 */

export type XpEventType =
  | "task_solved"
  | "task_solved_without_hint"
  | "session_finished"
  | "mistake_review"
  | "explain_read";

export interface XpEventClient {
  clientEventId: string; // uuid
  userId: string;
  type: XpEventType;
  createdAt: string; // ISO
  meta?: Record<string, any>; // e.g. taskId, topicId, hintsUsed, sessionDuration
  computedXp: number; // what frontend thinks
}

export interface XpEventServer extends XpEventClient {
  serverEventId: string;
  accepted: boolean;
  confirmedXp: number; // backend final
  rejectedReason?: string;
}

export interface UserXpSummary {
  userId: string;
  totalXp: number;
  weeklyXp: number;
  level?: number;
  xpToNextLevel?: number;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  weeklyXp: number;
  rank: number;
}

export interface LeaderboardResponse {
  weekStart: string; // ISO
  weekEnd: string; // ISO
  myEntry: LeaderboardEntry;
  entries: LeaderboardEntry[];
}


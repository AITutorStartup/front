/**
 * XP Rules Module
 * 
 * Pure computation module for calculating XP from events.
 * All XP values are configurable from this single place.
 */

import { XpEventType, XpEventClient } from "./types";

/**
 * XP configuration constants
 * Easy to tweak and balance the XP system
 */
export const XP_RULES = {
  task_solved: 20,
  task_solved_without_hint: 30, // bonus for no hints
  session_finished: {
    base: 10,
    minDurationMinutes: 5, // minimum session duration to earn XP
    bonusPerMinute: 1, // additional XP per minute after minimum
    maxBonus: 20, // maximum bonus XP
  },
  mistake_review: 5,
  explain_read: 3,
} as const;

/**
 * Calculate XP for an event
 * 
 * @param event - XP event without computedXp
 * @returns computed XP value
 */
export function computeXp(
  event: Omit<XpEventClient, "computedXp" | "clientEventId" | "createdAt" | "userId">
): number {
  switch (event.type) {
    case "task_solved":
      return XP_RULES.task_solved;

    case "task_solved_without_hint":
      return XP_RULES.task_solved_without_hint;

    case "session_finished": {
      const duration = event.meta?.sessionDuration as number | undefined;
      if (!duration || duration < XP_RULES.session_finished.minDurationMinutes) {
        return 0; // Too short session
      }

      const base = XP_RULES.session_finished.base;
      const bonusMinutes = Math.max(0, duration - XP_RULES.session_finished.minDurationMinutes);
      const bonus = Math.min(
        bonusMinutes * XP_RULES.session_finished.bonusPerMinute,
        XP_RULES.session_finished.maxBonus
      );
      return base + bonus;
    }

    case "mistake_review":
      return XP_RULES.mistake_review;

    case "explain_read":
      return XP_RULES.explain_read;

    default:
      return 0;
  }
}

/**
 * Calculate level from total XP
 * Uses a simple formula: level = floor(sqrt(totalXp / 100))
 * 
 * @param totalXp - Total XP accumulated
 * @returns level number (starts at 1)
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp <= 0) return 1;
  return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

/**
 * Calculate XP needed for next level
 * 
 * @param currentLevel - Current level
 * @returns XP needed to reach next level
 */
export function xpForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  const xpForNext = Math.pow(nextLevel - 1, 2) * 100;
  const xpForCurrent = Math.pow(currentLevel - 1, 2) * 100;
  return xpForNext - xpForCurrent;
}

/**
 * Calculate XP progress to next level
 * 
 * @param totalXp - Current total XP
 * @returns Object with current level, XP to next level, and progress (0-1)
 */
export function calculateLevelProgress(totalXp: number) {
  const level = calculateLevel(totalXp);
  const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progress = Math.min(1, Math.max(0, xpInCurrentLevel / xpNeeded));

  return {
    level,
    xpToNextLevel: xpNeeded - xpInCurrentLevel,
    progress,
    xpInCurrentLevel,
    xpForNextLevel: xpNeeded,
  };
}


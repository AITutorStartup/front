/**
 * XP API Client
 * 
 * This module provides functions to interact with the XP backend API.
 * Currently uses mock adapters, but structured to easily swap to real API calls.
 */

import { XpEventClient, XpEventServer, UserXpSummary } from "./types";
import { computeXp } from "./xpRules";

// Mock user ID - in real app, get from auth context
const MOCK_USER_ID = "user-123";

/**
 * Mock XP events storage (simulates backend)
 */
let mockXpEvents: XpEventServer[] = [];
let mockSummary: UserXpSummary = {
  userId: MOCK_USER_ID,
  totalXp: 0,
  weeklyXp: 0,
  level: 1,
  xpToNextLevel: 100,
  updatedAt: new Date().toISOString(),
};

/**
 * Get start of current week (Monday)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Calculate weekly XP from events
 */
function calculateWeeklyXp(events: XpEventServer[]): number {
  const weekStart = getWeekStart();
  return events
    .filter((e) => new Date(e.createdAt) >= weekStart)
    .reduce((sum, e) => sum + (e.accepted ? e.confirmedXp : 0), 0);
}

/**
 * Post XP events to backend
 * 
 * In real implementation, this would POST to /api/xp/events
 * For now, simulates backend confirmation with some variance
 */
export async function postXpEvents(
  events: XpEventClient[]
): Promise<XpEventServer[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

  const serverEvents: XpEventServer[] = events.map((event) => {
    // Simulate backend confirmation
    // Usually accepts, sometimes adjusts XP by ±10%, rarely rejects
    const random = Math.random();
    let accepted = true;
    let confirmedXp = event.computedXp;
    let rejectedReason: string | undefined;

    if (random < 0.05) {
      // 5% chance of rejection
      accepted = false;
      rejectedReason = "Event validation failed";
      confirmedXp = 0;
    } else if (random < 0.15) {
      // 10% chance of adjustment (±10%)
      const adjustment = 1 + (Math.random() - 0.5) * 0.2; // ±10%
      confirmedXp = Math.round(event.computedXp * adjustment);
    }

    return {
      ...event,
      serverEventId: `server-${Date.now()}-${Math.random()}`,
      accepted,
      confirmedXp,
      rejectedReason,
    };
  });

  // Store in mock storage
  mockXpEvents.push(...serverEvents);

  // Update summary
  const totalXp = mockXpEvents
    .filter((e) => e.accepted)
    .reduce((sum, e) => sum + e.confirmedXp, 0);
  const weeklyXp = calculateWeeklyXp(mockXpEvents);

  mockSummary = {
    ...mockSummary,
    totalXp,
    weeklyXp,
    updatedAt: new Date().toISOString(),
  };

  return serverEvents;
}

/**
 * Get user XP summary
 * 
 * In real implementation, this would GET /api/xp/summary
 */
export async function getXpSummary(): Promise<UserXpSummary> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300));

  // Recalculate to ensure consistency
  const totalXp = mockXpEvents
    .filter((e) => e.accepted)
    .reduce((sum, e) => sum + e.confirmedXp, 0);
  const weeklyXp = calculateWeeklyXp(mockXpEvents);

  mockSummary = {
    ...mockSummary,
    totalXp,
    weeklyXp,
    updatedAt: new Date().toISOString(),
  };

  return { ...mockSummary };
}

/**
 * Reset mock data (for testing)
 */
export function resetMockXpData() {
  mockXpEvents = [];
  mockSummary = {
    userId: MOCK_USER_ID,
    totalXp: 0,
    weeklyXp: 0,
    level: 1,
    xpToNextLevel: 100,
    updatedAt: new Date().toISOString(),
  };
}



/**
 * XP Store
 * 
 * This module implements the XP state management with:
 * - Optimistic updates: UI updates immediately when XP is earned
 * - Pending events queue: Events are queued and synced to backend
 * - localStorage persistence: Critical state is saved locally
 * - Backend confirmation: When backend confirms, we reconcile any differences
 * 
 * Architecture:
 * - Frontend computes XP immediately (optimistic)
 * - Events are queued and synced to backend
 * - Backend confirms or adjusts XP values
 * - Frontend reconciles confirmed values with optimistic updates
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
// Simple UUID generator
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}`;
}
import { XpEventClient, XpEventServer, UserXpSummary, XpEventType } from "./types";
import { computeXp, calculateLevelProgress } from "./xpRules";
import { postXpEvents, getXpSummary } from "./xpApi";

const STORAGE_KEY = "xp-store";
const SYNC_DEBOUNCE_MS = 2000; // Sync after 2 seconds of inactivity

interface XpState {
  summary: UserXpSummary;
  pendingEvents: XpEventClient[];
  syncedEvents: XpEventServer[];
  syncStatus: "idle" | "syncing" | "error";
  lastSyncTime: number | null;
}

type XpAction =
  | { type: "AWARD_XP"; event: Omit<XpEventClient, "computedXp" | "clientEventId" | "createdAt" | "userId"> }
  | { type: "SYNC_START" }
  | { type: "SYNC_SUCCESS"; events: XpEventServer[] }
  | { type: "SYNC_ERROR"; error: string }
  | { type: "LOAD_FROM_STORAGE"; state: XpState }
  | { type: "UPDATE_SUMMARY"; summary: UserXpSummary };

const initialState: XpState = {
  summary: {
    userId: "user-123",
    totalXp: 0,
    weeklyXp: 0,
    level: 1,
    xpToNextLevel: 100,
    updatedAt: new Date().toISOString(),
  },
  pendingEvents: [],
  syncedEvents: [],
  syncStatus: "idle",
  lastSyncTime: null,
};

function xpReducer(state: XpState, action: XpAction): XpState {
  switch (action.type) {
    case "AWARD_XP": {
      const computedXp = computeXp(action.event);
      const clientEvent: XpEventClient = {
        ...action.event,
        clientEventId: generateUUID(),
        userId: state.summary.userId,
        createdAt: new Date().toISOString(),
        computedXp,
      };

      // Optimistic update: immediately update UI
      const levelProgress = calculateLevelProgress(state.summary.totalXp + computedXp);
      const optimisticSummary: UserXpSummary = {
        ...state.summary,
        totalXp: state.summary.totalXp + computedXp,
        weeklyXp: state.summary.weeklyXp + computedXp,
        level: levelProgress.level,
        xpToNextLevel: levelProgress.xpToNextLevel,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...state,
        summary: optimisticSummary,
        pendingEvents: [...state.pendingEvents, clientEvent],
      };
    }

    case "SYNC_START":
      return {
        ...state,
        syncStatus: "syncing",
      };

    case "SYNC_SUCCESS": {
      // Reconcile confirmed XP with optimistic updates
      const confirmedTotal = action.events
        .filter((e) => e.accepted)
        .reduce((sum, e) => sum + e.confirmedXp, 0);

      // Calculate difference between optimistic and confirmed
      const optimisticTotal = state.summary.totalXp;
      const difference = confirmedTotal - optimisticTotal;

      // Update summary with confirmed values
      const levelProgress = calculateLevelProgress(confirmedTotal);
      const reconciledSummary: UserXpSummary = {
        ...state.summary,
        totalXp: confirmedTotal,
        weeklyXp: state.summary.weeklyXp + difference, // Adjust weekly too
        level: levelProgress.level,
        xpToNextLevel: levelProgress.xpToNextLevel,
        updatedAt: new Date().toISOString(),
      };

      // Remove synced events from pending
      const syncedIds = new Set(action.events.map((e) => e.clientEventId));
      const remainingPending = state.pendingEvents.filter(
        (e) => !syncedIds.has(e.clientEventId)
      );

      return {
        ...state,
        summary: reconciledSummary,
        pendingEvents: remainingPending,
        syncedEvents: [...state.syncedEvents, ...action.events],
        syncStatus: "idle",
        lastSyncTime: Date.now(),
      };
    }

    case "SYNC_ERROR":
      return {
        ...state,
        syncStatus: "error",
      };

    case "LOAD_FROM_STORAGE":
      return action.state;

    case "UPDATE_SUMMARY":
      return {
        ...state,
        summary: action.summary,
      };

    default:
      return state;
  }
}

interface XpContextValue {
  summary: UserXpSummary;
  pendingEvents: XpEventClient[];
  syncStatus: "idle" | "syncing" | "error";
  awardXp: (
    type: XpEventType,
    meta?: Record<string, any>
  ) => void;
  syncXp: () => Promise<void>;
  refreshSummary: () => Promise<void>;
}

const XpContext = createContext<XpContextValue | undefined>(undefined);

export function XpProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(xpReducer, initialState);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: "LOAD_FROM_STORAGE", state: parsed });
      }
    } catch (error) {
      console.error("Failed to load XP state from localStorage", error);
    }
  }, []);

  // Persist to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save XP state to localStorage", error);
    }
  }, [state]);

  // Handle online/offline
  useEffect(() => {
    const handleOnline = () => {
      isOnlineRef.current = true;
      if (state.pendingEvents.length > 0) {
        syncXp();
      }
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [state.pendingEvents.length]);

  const syncXp = useCallback(async () => {
    if (state.pendingEvents.length === 0 || !isOnlineRef.current) {
      return;
    }

    if (state.syncStatus === "syncing") {
      return; // Already syncing
    }

    dispatch({ type: "SYNC_START" });

    try {
      const confirmed = await postXpEvents(state.pendingEvents);
      dispatch({ type: "SYNC_SUCCESS", events: confirmed });

      // Check for rejected events and show warning if needed
      const rejected = confirmed.filter((e) => !e.accepted);
      if (rejected.length > 0) {
        console.warn("Some XP events were rejected:", rejected);
        // Could trigger a toast here
      }
    } catch (error) {
      console.error("Failed to sync XP events", error);
      dispatch({
        type: "SYNC_ERROR",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [state.pendingEvents, state.syncStatus]);

  // Debounced sync
  const scheduleSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncXp();
    }, SYNC_DEBOUNCE_MS);
  }, [syncXp]);

  const awardXp = useCallback(
    (type: XpEventType, meta?: Record<string, any>) => {
      dispatch({
        type: "AWARD_XP",
        event: { type, meta },
      });

      // Schedule sync after debounce
      scheduleSync();
    },
    [scheduleSync]
  );

  const refreshSummary = useCallback(async () => {
    try {
      const summary = await getXpSummary();
      dispatch({ type: "UPDATE_SUMMARY", summary });
    } catch (error) {
      console.error("Failed to refresh XP summary", error);
    }
  }, []);

  const value: XpContextValue = {
    summary: state.summary,
    pendingEvents: state.pendingEvents,
    syncStatus: state.syncStatus,
    awardXp,
    syncXp,
    refreshSummary,
  };

  return <XpContext.Provider value={value}>{children}</XpContext.Provider>;
}

export function useXp() {
  const context = useContext(XpContext);
  if (!context) {
    throw new Error("useXp must be used within XpProvider");
  }
  return context;
}

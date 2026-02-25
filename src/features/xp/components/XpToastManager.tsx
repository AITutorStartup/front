import { useEffect, useState } from "react";
import { useXp } from "@/features/xp/xpStore";
import XpToast from "./XpToast";

interface PendingToast {
  id: string;
  xpAmount: number;
}

export default function XpToastManager() {
  const { pendingEvents } = useXp();
  const [toasts, setToasts] = useState<PendingToast[]>([]);

  useEffect(() => {
    // Show toast for the most recent pending event
    if (pendingEvents.length > 0) {
      const latest = pendingEvents[pendingEvents.length - 1];
      const toastId = latest.clientEventId;

      // Only add if not already shown
      if (!toasts.find((t) => t.id === toastId)) {
        setToasts((prev) => [
          ...prev,
          { id: toastId, xpAmount: latest.computedXp },
        ]);
      }
    }
  }, [pendingEvents, toasts]);

  const handleComplete = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <XpToast
          key={toast.id}
          xpAmount={toast.xpAmount}
          onComplete={() => handleComplete(toast.id)}
        />
      ))}
    </>
  );
}



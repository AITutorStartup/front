import { useEffect, useState } from "react";
import { useXp } from "../xpStore";
import styles from "./XpToast.module.css";

interface XpToastProps {
  xpAmount: number;
  onComplete: () => void;
}

export default function XpToast({ xpAmount, onComplete }: XpToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 200); // Wait for animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`${styles.toast} ${isVisible ? styles.visible : styles.hidden}`}
    >
      <div className={styles.content}>
        <span className={styles.plus}>+</span>
        <span className={styles.amount}>{xpAmount}</span>
        <span className={styles.label}>XP</span>
      </div>
    </div>
  );
}



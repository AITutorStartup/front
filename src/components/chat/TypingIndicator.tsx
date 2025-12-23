/**
 * TypingIndicator Component - Modern Redesign
 * 
 * Key changes:
 * - Subtle, minimalistic typing animation
 * - Smooth fade-in appearance
 * - Better alignment with message layout
 */

import { Bot } from "lucide-react";
import styles from "./TypingIndicator.module.css";

const TypingIndicator = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          <Bot className={styles.icon} size={16} />
        </div>
      </div>
      <div className={styles.dotsContainer}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default TypingIndicator;

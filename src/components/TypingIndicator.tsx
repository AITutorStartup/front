// TypingIndicator.tsx (версия с CSS-модулями)

import { Bot } from "lucide-react";
import styles from "./TypingIndicator.module.css"; // Импортируем стили

const TypingIndicator = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.avatar}>
        <Bot className={styles.icon} />
      </div>
      <div className={styles.dotsContainer}>
        {/* Применяем классы для каждой точки */}
        <div className={`${styles.dot} ${styles.dot1}`}></div>
        <div className={`${styles.dot} ${styles.dot2}`}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;

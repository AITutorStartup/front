import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./AccountDropdown.module.css";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
};

interface AccountDropdownProps {
  onLogout?: () => void;
}

const AccountDropdown = ({ onLogout }: AccountDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      <motion.button
        type="button"
        className={styles.authLink}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        Профиль
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.dropdownMenu}
            initial={{ opacity: 0, scale: 0.95, y: -8, x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: -8, x: "-50%" }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "top center" }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Link to="/about-study" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                  Об учебе
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/leaderboard" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                  Таблица лидеров
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/settings" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                  Настройки
                </Link>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Link to="/help" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
                  Помощь
                </Link>
              </motion.div>
              {onLogout && (
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="button"
                    onClick={() => { setIsOpen(false); onLogout(); }}
                    whileHover={{ backgroundColor: "hsl(var(--destructive) / 0.1)" }}
                    style={{
                      width: "100%",
                      padding: "0.6rem 1rem",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderTop: "1px solid hsl(var(--border))",
                      color: "hsl(var(--destructive, var(--foreground)))",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      marginTop: "0.25rem",
                      borderRadius: "0 0 8px 8px",
                      display: "block",
                    }}
                  >
                    Выйти
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountDropdown;

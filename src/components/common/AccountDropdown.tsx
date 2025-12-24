import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AccountDropdown.module.css";

const AccountDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  return (
    <div 
      className={styles.dropdownContainer}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.authLink} style={{ cursor: "default", pointerEvents: "none" }}>
        Профиль
      </div>
      {isOpen && (
        <div 
          className={styles.dropdownMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link to="/about-study" className={styles.dropdownItem}>
            Об учебе
          </Link>
          <Link to="/settings" className={styles.dropdownItem}>
            Настройки
          </Link>
          <Link to="/help" className={styles.dropdownItem}>
            Помощь
          </Link>
        </div>
      )}
    </div>
  );
};

export default AccountDropdown;


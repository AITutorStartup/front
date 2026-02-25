import { ReactNode } from "react";
import styles from "./KpiCard.module.css";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: ReactNode;
  gradient?: "primary" | "accent" | "success" | "warning";
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  gradient = "primary",
}: KpiCardProps) {
  return (
    <div className={`${styles.card} ${styles[`gradient-${gradient}`]}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        {trend && (
          <div
            className={`${styles.trend} ${
              trend.isPositive ? styles.trendPositive : styles.trendNegative
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}


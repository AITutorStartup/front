

import { BookOpen, FileText, CheckCircle } from "lucide-react";
import styles from "./QuickActions.module.css";

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
}

const QuickActions = ({ onAction, disabled }: QuickActionsProps) => {
  const actions = [
    { icon: BookOpen, label: "Объясни тему", action: "explain" },
    { icon: FileText, label: "Дай задание", action: "task" },
    { icon: CheckCircle, label: "Проверь решение", action: "check" },
  ];

  return (
    <div className={styles.container}>
      {actions.map((item) => (
        <button
          key={item.action}
          onClick={() => onAction(item.action)}
          disabled={disabled}
          className={styles.button}
        >
          <item.icon className={styles.icon} />
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;

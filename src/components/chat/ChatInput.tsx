import { useState, KeyboardEvent } from "react";
import { Send, X } from "lucide-react";
import styles from "./ChatInput.module.css"; 

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  onCancel?: () => void;
  showCancel?: boolean;
}

const ChatInput = ({ onSend, disabled, onCancel, showCancel }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!showCancel) {
        handleSend();
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.form}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение... (Enter для отправки, Shift+Enter для новой строки)"
            disabled={disabled}
            className={styles.textarea}
          />

          {showCancel && onCancel ? (
            <button
              onClick={handleCancel}
              className={styles.cancelButton}
              title="Остановить генерацию"
            >
              <X className={styles.cancelIcon} />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className={styles.sendButton}
            >
              <Send className={styles.sendIcon} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

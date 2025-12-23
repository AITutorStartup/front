/**
 * ChatInput Component - Modern Redesign
 * 
 * Key changes:
 * - Clean, minimalistic input with subtle border
 * - Primary send button with clear visual hierarchy
 * - Smooth focus states and transitions
 * - Better button placement and spacing
 * - Improved accessibility and touch targets
 */

import { useState, KeyboardEvent, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
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
        <div className={styles.inputContainer}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение..."
            disabled={disabled}
            className={styles.textarea}
            rows={1}
          />
          
          <div className={styles.actions}>
            {showCancel && onCancel ? (
              <button
                onClick={handleCancel}
                className={styles.cancelButton}
                title="Остановить генерацию"
                aria-label="Остановить генерацию"
              >
                <X size={18} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                className={styles.sendButton}
                title="Отправить сообщение"
                aria-label="Отправить сообщение"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

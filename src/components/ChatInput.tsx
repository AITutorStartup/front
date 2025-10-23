import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import styles from "./ChatInput.module.css"; 

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className={styles.sendButton}
          >
            <Send className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

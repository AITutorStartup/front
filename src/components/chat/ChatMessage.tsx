import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Bot, User } from "lucide-react";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

const ChatMessage = ({ content, isUser }: ChatMessageProps) => {
  const combineClasses = (...classNames: (string | boolean | undefined)[]) => {
    return classNames.filter(Boolean).join(" ");
  };

  return (
    <div
      className={combineClasses(
        styles.messageWrapper,
        isUser ? styles.userMessage : styles.aiMessage
      )}
    >
      <div
        className={combineClasses(
          styles.avatar,
          isUser ? styles.userAvatar : styles.aiAvatar
        )}
      >
        {isUser ? (
          <User className={styles.icon} />
        ) : (
          <Bot className={styles.icon} />
        )}
      </div>

      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({ children }) => <p>{children}</p>,
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className={styles.inlineCode}>{children}</code>
              ) : (
                <code className={combineClasses(styles.codeBlock, className)}>
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default ChatMessage;

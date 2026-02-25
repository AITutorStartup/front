/**
 * ChatMessage Component - Modern Redesign
 * 
 * Key changes:
 * - Minimalistic card-style messages with subtle elevation
 * - Clear visual distinction between user and AI messages
 * - Improved typography and spacing for readability
 * - Smooth fade-in animation for new messages
 * - Better responsive layout with optimal reading width
 */

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
  return (
    <div
      className={`${styles.messageWrapper} ${isUser ? styles.userMessage : styles.aiMessage}`}
    >
      <div className={styles.avatarContainer}>
        <div className={`${styles.avatar} ${isUser ? styles.userAvatar : styles.aiAvatar}`}>
          {isUser ? (
            <User className={styles.icon} size={16} />
          ) : (
            <Bot className={styles.icon} size={16} />
          )}
        </div>
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.content}>
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: ({ children }) => <p className={styles.paragraph}>{children}</p>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className={styles.inlineCode}>{children}</code>
                ) : (
                  <pre className={styles.codeBlockWrapper}>
                    <code className={styles.codeBlock}>{children}</code>
                  </pre>
                );
              },
              ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
              ol: ({ children }) => <ol className={styles.list}>{children}</ol>,
              li: ({ children }) => <li className={styles.listItem}>{children}</li>,
              strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;

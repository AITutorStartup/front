import React, { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = ({ className, ...props }: TextareaProps) => {
  const textareaClasses = `${styles.textarea} ${className || ''}`;

  return <textarea className={textareaClasses} {...props} />;
};

export default Textarea;

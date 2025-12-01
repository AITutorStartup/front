import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = ({ children, className, ...props }: ButtonProps) => {
  const buttonClasses = `${styles.button} ${className || ''}`;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;

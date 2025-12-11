import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  showCount?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  value, 
  maxLength, 
  showCount = false,
  className,
  ...props 
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.textareaWrapper}>
        <textarea
          className={`${styles.textarea} ${className || ''}`}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        {showCount && (
          <span className={styles.charCount}>
            {currentLength}{maxLength ? ` / ${maxLength}` : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextArea;


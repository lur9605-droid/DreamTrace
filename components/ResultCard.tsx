'use client';

import React from 'react';
import styles from './ResultCard.module.css';
import { EmotionLabel } from '../lib/types';

interface ResultCardProps {
  title?: string;
  date?: string;
  summary: string;
  keywords: string[];
  emotions: EmotionLabel[];
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  title = "梦境解析结果",
  date,
  summary,
  keywords,
  emotions,
  className,
}) => {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {date && <span className={styles.date}>{date}</span>}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>摘要</div>
        <p className={styles.summary}>{summary}</p>
      </div>

      {keywords.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>关键词</div>
          <ul className={styles.tagList}>
            {keywords.map((keyword, index) => (
              <li key={index} className={styles.tag}>
                #{keyword}
              </li>
            ))}
          </ul>
        </div>
      )}

      {emotions.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>情绪分析</div>
          <div className={styles.emotionList}>
            {emotions.map((emotion, index) => (
              <div key={index} className={styles.emotionItem}>
                <span className={styles.emotionName}>{emotion.name}</span>
                <div className={styles.progressBarWrapper}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${Math.min(100, Math.max(0, emotion.score))}%` }}
                  ></div>
                </div>
                <span className={styles.emotionScore}>{emotion.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultCard;

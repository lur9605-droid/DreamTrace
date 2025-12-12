'use client';

import React, { useState } from 'react';
import styles from './DiaryItem.module.css';
import { DreamRecord, EmotionLabel } from '../lib/types';
import ResultCard from './ResultCard';

interface DiaryItemProps {
  record: DreamRecord;
  onDelete: (id: string) => void;
  onExport: (record: DreamRecord) => void;
}

const DiaryItem: React.FC<DiaryItemProps> = ({ record, onDelete, onExport }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(record.id);
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExport(record);
  };

  // Generate a simple summary if not available from extraction (fallback)
  const summary = record.extracted 
    ? `关键词: ${record.extracted.keywords.join(', ')}`
    : (record.content || '').slice(0, 50) + '...';

  return (
    <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header} onClick={toggleExpand}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>{record.title}</h3>
          <span className={styles.date}>{record.date}</span>
        </div>
        
        <div className={styles.actions}>
           <button 
            className={styles.btn} 
            onClick={handleExport}
            title="导出 JSON"
          >
            导出
          </button>
          <button 
            className={`${styles.btn} ${styles.deleteBtn}`} 
            onClick={handleDelete}
            title="删除"
          >
            删除
          </button>
          <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          <div className={styles.content}>
            {record.content}
          </div>

          {record.extracted && (
            <ResultCard 
              summary={`分析结果包含 ${record.extracted.keywords.length} 个关键词和 ${record.extracted.emotions.length} 个情绪指标。`}
              extracted={record.extracted}
              rawText={record.content || ''}
            />
          )}
          
          {!record.extracted && (
             <div className={styles.tags}>
               {record.tags?.map(tag => (
                 <span key={tag} className={styles.tag}>#{tag}</span>
               ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiaryItem;

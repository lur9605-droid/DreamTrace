"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { loadRecords } from '@/lib/storage';
import { DreamRecord } from '@/lib/types';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function DiaryPage() {
  const [records, setRecords] = useState<DreamRecord[]>([]);

  useEffect(() => {
    const loaded = loadRecords();
    // Sort by date descending
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecords(loaded);
  }, []);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEmotionColor = (emotion?: string) => {
    const colors: Record<string, string> = {
      joy: '#FFD700',
      sadness: '#87CEEB',
      anger: '#FF6B6B',
      fear: '#A893FF',
      anxiety: '#FFA07A',
      neutral: '#E0E0E0',
      serene: '#98FB98',
      curious: '#87CEFA',
    };
    // Default to a soft purple if emotion not found
    return colors[emotion?.toLowerCase() || ''] || '#DCD6F7';
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>DREAM LOG</h1>
      
      <div className={styles.timeline}>
        {records.map((record, index) => {
           // Get the first emotion or a default
           const mainEmotion = record.extracted?.emotions?.[0];
           const emotionLabel = typeof mainEmotion === 'string' ? mainEmotion : mainEmotion?.name;
           
           return (
            <div key={record.id} className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                {index % 3 === 0 ? '🌙' : index % 3 === 1 ? '✨' : '☁️'}
              </div>
              
              <Link href={`/analysis?resume=${record.id}`} className={styles.card}>
                <div className={styles.date}>{formatDate(record.createdAt)}</div>
                <p className={styles.content}>
                  {record.summary || record.rawText || record.content}
                </p>
                {(() => {
                  const inferredInProgress = record.status === 'in_progress' || (!record.summary && !record.extracted);
                  return (
                    <span className={styles.stateHint}>
                      {inferredInProgress ? '还可以继续聊聊' : '已生成解析'}
                    </span>
                  );
                })()}
                
                {emotionLabel && emotionLabel !== 'neutral' && (
                  <span 
                    className={styles.emotionBadge}
                    style={{ backgroundColor: getEmotionColor(emotionLabel) }}
                  >
                    {emotionLabel}
                  </span>
                )}
                {(!emotionLabel || emotionLabel === 'neutral') && (
                  <span className={styles.stateHint} style={{ marginLeft: 8 }}>
                    {record.status === 'completed' ? '情绪未识别' : '未分析'}
                  </span>
                )}
              </Link>
            </div>
          );
        })}
        
        {records.length === 0 && (
           <div className={styles.emptyState}>
             <p>还没有梦境记录，去<Link href="/analysis">记录一个</Link>吧！</p>
           </div>
        )}

        <div className={styles.addButtonWrapper}>
             <Link href="/analysis" className={styles.addButton}>+</Link>
        </div>
      </div>
    </div>
  );
}

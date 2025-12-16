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
           // Determine display status (Strictly 3 states)
           let displayStatus = '尚未理解';
           if (record.status === 'completed') {
             displayStatus = '已被回应';
           } else if (record.status === 'in_progress') {
             displayStatus = '正在倾听';
           }

           // Extract initial snippet (1-2 sentences)
           const fullText = record.rawText || record.content || '';
           // remove "User: " prefix if present
           const cleanText = fullText.replace(/^用户：/, '').replace(/^AI：.*/s, ''); 
           const sentences = cleanText.split(/[。！？\n]/).filter(Boolean);
           const snippet = sentences.slice(0, 2).join('。') + (sentences.length > 2 || cleanText.length > 100 ? '...' : '');
           
           return (
            <div key={record.id} className={styles.timelineItem}>
              <div className={styles.timelineIcon}>
                {index % 3 === 0 ? '🌙' : index % 3 === 1 ? '✨' : '☁️'}
              </div>
              
              <Link href={`/analysis?resume=${record.id}&mode=review`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.date}>{formatDate(record.createdAt)}</div>
                  <div className={`${styles.statusBadge} ${styles[record.status === 'completed' ? 'statusCompleted' : record.status === 'in_progress' ? 'statusListening' : 'statusUnknown']}`}>
                    {displayStatus}
                  </div>
                </div>
                
                <p className={styles.snippet}>
                  {snippet || '（无内容）'}
                </p>
                
                <div className={styles.cardFooter}>
                  <span className={styles.enterAction}>
                    {record.status === 'completed' ? '回顾这次梦' : '继续这次对话'} →
                  </span>
                </div>
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

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import TrendChart from '../../components/TrendChart';
import { loadRecords } from '../../lib/storage';
import { DreamRecord } from '../../lib/types';

export default function TrendsPage() {
  const [records, setRecords] = useState<DreamRecord[]>([]);
  const [days, setDays] = useState<7 | 30>(7);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const filteredRecords = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setDate(now.getDate() - days);
    
    return records.filter(r => new Date(r.date) >= cutoff);
  }, [records, days]);

  const emotionStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredRecords.forEach(r => {
      r.extracted?.emotions.forEach(e => {
        stats[e.name] = (stats[e.name] || 0) + 1;
      });
    });
    return Object.entries(stats)
      .map(([label, value]) => ({ label, value, color: getColorForEmotion(label) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const keywordStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredRecords.forEach(r => {
      r.extracted?.keywords.forEach(k => {
        stats[k] = (stats[k] || 0) + 1;
      });
    });
    return Object.entries(stats)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredRecords]);

  function getColorForEmotion(emotion: string) {
    const colors: Record<string, string> = {
      '快乐': '#10b981',
      '平静': '#3b82f6',
      '焦虑': '#f59e0b',
      '恐惧': '#ef4444',
      '悲伤': '#6366f1',
      '愤怒': '#dc2626',
    };
    return colors[emotion] || '#888888';
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>梦境趋势</h1>
        <div className={styles.controls}>
          <button 
            className={`${styles.filterBtn} ${days === 7 ? styles.active : ''}`}
            onClick={() => setDays(7)}
          >
            最近 7 天
          </button>
          <button 
            className={`${styles.filterBtn} ${days === 30 ? styles.active : ''}`}
            onClick={() => setDays(30)}
          >
            最近 30 天
          </button>
        </div>
      </header>

      {records.length === 0 ? (
        <div className={styles.emptyState}>
          <p>暂无数据，快去记录你的第一个梦吧！</p>
          <a href="/analysis" style={{ color: '#0070f3' }}>去记录</a>
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>情绪分布</h2>
            <TrendChart 
              data={emotionStats} 
              width={400} 
              height={300} 
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>高频关键词 Top 10</h2>
            {keywordStats.length > 0 ? (
              <ul className={styles.keywordList}>
                {keywordStats.map((item, index) => (
                  <li key={item.label} className={styles.keywordItem}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className={styles.keywordRank}>{(index + 1).toString()}</span>
                      <span className={styles.keywordText}>{item.label}</span>
                    </div>
                    <span className={styles.keywordCount}>{item.value}次</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>此时间段内无关键词数据</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
    return records.filter(r => {
      const d = r.date ? new Date(r.date) : (r.createdAt ? new Date(r.createdAt) : null);
      return d ? d >= cutoff : false;
    });
  }, [records, days]);

  const emotionTimeline = useMemo(() => {
    // 1. Filter completed records with emotions
    const validRecords = filteredRecords
      .filter(r => r.status === 'completed' && r.extracted?.emotions?.length)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // 2. Map to chart format
    return validRecords.map(r => {
      const mainEmotion = r.extracted?.emotions[0];
      const emotionName = typeof mainEmotion === 'string' ? mainEmotion : mainEmotion?.name;
      return {
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: getEmotionValue(emotionName || ''),
        emotion: emotionName,
        color: getColorForEmotion(emotionName || ''),
        summary: r.summary || '无摘要'
      };
    });
  }, [filteredRecords]);

  function getEmotionValue(emotion: string) {
    const values: Record<string, number> = {
      '快乐': 9, 'joy': 9,
      '平静': 7, 'serene': 7,
      'neutral': 5,
      '焦虑': 3, 'anxiety': 3,
      '悲伤': 2, 'sadness': 2,
      '恐惧': 2, 'fear': 2,
      '愤怒': 1, 'anger': 1
    };
    return values[emotion] || 5;
  }

  function getColorForEmotion(emotion: string) {
    const colors: Record<string, string> = {
      '快乐': '#10b981',
      '平静': '#3b82f6',
      '焦虑': '#f59e0b',
      '恐惧': '#ef4444',
      '悲伤': '#6366f1',
      '愤怒': '#dc2626',
      'joy': '#10b981',
      'serene': '#3b82f6',
      'anxiety': '#f59e0b',
      'fear': '#ef4444',
      'sadness': '#6366f1',
      'anger': '#dc2626',
      'neutral': '#9ca3af'
    };
    return colors[emotion] || '#888888';
  }

  const keywordStats = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredRecords.forEach(r => {
      if (r.extracted?.keywords) {
        r.extracted.keywords.forEach((k: string) => {
          stats[k] = (stats[k] || 0) + 1;
        });
      }
    });
    
    return Object.entries(stats)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

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
          <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.cardTitle}>情绪变化轨迹</h2>
            <TrendChart 
              data={emotionTimeline} 
              width={800} 
              height={300} 
              type="line"
            />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>情绪分布</h2>
            {/* Keeping the pie/bar chart logic for distribution if needed, or remove */}
            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
              （分布图表待更新）
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>高频关键词 Top 10</h2>
            {keywordStats?.length > 0 ? (
              <ul className={styles.keywordList}>
                {keywordStats?.slice(0, 10).map((item: { label: string; value: number }, index: number) => (
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

"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { loadRecords } from '@/lib/storage';
import { DreamRecord } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// Helper to map emotions to colors and scores
const getEmotionData = (emotion: string = 'neutral') => {
  const map: Record<string, { color: string; score: number; label: string }> = {
    joy: { color: '#FFD700', score: 90, label: 'Joy' },
    happy: { color: '#FFD700', score: 85, label: 'Happy' },
    serene: { color: '#98FB98', score: 80, label: 'Serene' },
    curious: { color: '#87CEFA', score: 60, label: 'Curious' },
    neutral: { color: '#E0E0E0', score: 50, label: 'Neutral' },
    anxiety: { color: '#FFA07A', score: 30, label: 'Anxiety' },
    fear: { color: '#A893FF', score: 20, label: 'Fear' },
    sadness: { color: '#87CEEB', score: 25, label: 'Sadness' },
    anger: { color: '#FF6B6B', score: 15, label: 'Anger' },
  };
  return map[emotion.toLowerCase()] || { color: '#DCD6F7', score: 50, label: emotion };
};

export default function StatsPage() {
  const [records, setRecords] = useState<DreamRecord[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loaded = loadRecords();
    // Sort by date ascending for chart
    const sorted = [...loaded].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    setRecords(loaded); // Keep original order (or desc?) for cards? Usually cards are newest first.
    
    // Prepare chart data
    const data = sorted.map(r => {
      const mainEmotion = r.extracted?.emotions?.[0];
      const emotionName = typeof mainEmotion === 'string' ? mainEmotion : mainEmotion?.name;
      const { score, color } = getEmotionData(emotionName);
      return {
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        fullDate: new Date(r.createdAt).toLocaleDateString(),
        score,
        emotion: emotionName || 'Unknown',
        color
      };
    });
    setChartData(data);
  }, []);

  // For cards, we might want newest first
  const recentRecords = [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dream Emotion Analysis</h1>
        <div className={styles.userIcon}>
             {/* Placeholder for user avatar */}
             <span>👤</span>
        </div>
      </header>

      <div className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <input type="text" placeholder="Dream Emotion" className={styles.searchInput} disabled />
        <span className={styles.filterIcon}>☹️</span>
        <span className={styles.filterIcon}>🙂</span>
      </div>

      <div className={styles.cardsScroll}>
        {recentRecords.map((r) => {
          const mainEmotion = r.extracted?.emotions?.[0];
          const emotionName = typeof mainEmotion === 'string' ? mainEmotion : mainEmotion?.name;
          const { color, label } = getEmotionData(emotionName);
          
          return (
            <div key={r.id} className={styles.emotionCard} style={{ '--card-accent': color } as React.CSSProperties}>
              <div className={styles.cardDate}>
                 {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className={styles.cardLabel}>Main emotion</div>
              <div className={styles.cardEmotion}>{label || 'Unknown'}</div>
              <div className={styles.cardIcon} style={{ backgroundColor: color }}>
                {/* Simple visual indicator */}
              </div>
            </div>
          );
        })}
        {recentRecords.length === 0 && (
            <div className={styles.emptyCard}>No records yet</div>
        )}
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <h2>Weekly Emotion</h2>
          <div className={styles.chartLegend}>
             <span className={styles.dot} style={{ background: '#A893FF' }}></span>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#999', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 100]} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#ccc', strokeDasharray: '3 3' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#8884d8" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
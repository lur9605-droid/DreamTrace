"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';
import { DREAM_DICTIONARY, DictionaryItem } from '@/data/dictionary';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = DREAM_DICTIONARY.filter(entry => 
    entry.term.includes(searchTerm) || 
    entry.meaning.includes(searchTerm)
  );

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Dream Dictionary</h1>
        
        <div className={styles.searchBarWrapper}>
          <input 
            type="text" 
            placeholder="Search dream symbols..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <div className={styles.gridSection}>
        {filteredEntries.map(entry => (
          <div 
            key={entry.id} 
            className={`${styles.card} ${expandedId === entry.id ? styles.expanded : ''}`}
            onClick={() => toggleExpand(entry.id)}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{entry.term}</h3>
              <span className={styles.cardCategory}>{entry.category}</span>
            </div>
            
            <div className={styles.cardContent}>
              <p className={styles.shortDesc}>{entry.short}</p>
              
              <div className={`${styles.fullMeaning} ${expandedId === entry.id ? styles.show : ''}`}>
                <div className={styles.divider}></div>
                <p>{entry.meaning}</p>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.expandHint}>
                {expandedId === entry.id ? '收起' : '展开解释'}
              </span>
              <div className={styles.iconWrapper}>
                {entry.icon}
              </div>
            </div>
          </div>
        ))}
        
        {filteredEntries.length === 0 && (
          <div className={styles.emptyState}>
            <p>未找到相关意象，换个关键词试试？</p>
          </div>
        )}
      </div>
    </div>
  );
}
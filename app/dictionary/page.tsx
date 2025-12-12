"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';
import { MOCK_DICTIONARY } from '@/lib/mockData';
import { DictionaryEntry } from '@/lib/types';

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);

  const filteredEntries = MOCK_DICTIONARY.filter(entry => 
    entry.keyword.includes(searchTerm) || 
    entry.interpretation.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      <BackButton />
      
      <div className={styles.searchSection}>
        <h1 className={styles.title}>Search your<br/>dream symbolism..</h1>
        <div className={styles.searchBarWrapper}>
          <input 
            type="text" 
            placeholder="Search your dream symbolism..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.searchButton}>
            🔍
          </button>
        </div>
      </div>

      <div className={styles.gridSection}>
        {filteredEntries.map(entry => (
          <div 
            key={entry.id} 
            className={styles.card}
            onClick={() => setSelectedEntry(entry)}
          >
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{entry.keyword}</h3>
              <span className={styles.cardCategory}>{entry.category}</span>
            </div>
            <p className={styles.cardPreview}>
              {entry.interpretation.substring(0, 40)}...
            </p>
            <div className={styles.cardFooter}>
              <span className={styles.clickHint}>Click to expand full content..</span>
              <div className={styles.dots}>
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEntry && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEntry(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedEntry(null)}>×</button>
            <h2 className={styles.modalTitle}>{selectedEntry.keyword}</h2>
            <span className={styles.modalCategory}>{selectedEntry.category}</span>
            <div className={styles.modalBody}>
              <p>{selectedEntry.interpretation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Correct hook for App Router
import styles from './page.module.css';
import { DictionaryEntry } from '../../../lib/types';

export default function DictionaryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadEntry = async () => {
      try {
        const data = await import('../../../data/dream-dictionary.json');
        const entries = (data.default || data) as unknown as DictionaryEntry[];
        const found = entries.find((e: DictionaryEntry) => e.id === id);
        setEntry(found || null);
      } catch (error) {
        console.error("Failed to load dictionary entry:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [id]);

  if (isLoading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  if (!entry) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>未找到词条</h1>
          <a href="/dictionary" className={styles.backLink}>返回词典列表</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <a href="/dictionary" className={styles.backLink}>← 返回词典列表</a>
      
      <article className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.keyword}>{entry.keyword}</h1>
          {entry.category && <span className={styles.category}>{entry.category}</span>}
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>💡 释义</h2>
          <p className={styles.text}>{entry.interpretation}</p>
        </section>

        {/* 
          Placeholder for future extended fields like 'questions_to_user' or 'symbolism_history'
          if added to the JSON schema later.
        */}
      </article>
    </div>
  );
}

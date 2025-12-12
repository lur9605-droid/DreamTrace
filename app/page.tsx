import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DreamTrace</h1>
      <p className={styles.subtitle}>
        在潜意识的海洋里，每一个梦都是未被拆封的信。
      </p>
      
      <div className={styles.mainAction}>
        <Link href="/analysis" className={styles.startBtn}>
          输入你的梦境吧
        </Link>
      </div>

      <div className={styles.secondaryNav}>
        <Link href="/diary" className={styles.navCard}>
          <span className={styles.navIcon}>📖</span>
          <span className={styles.navTitle}>梦境日记</span>
          <span className={styles.navDesc}>回顾过往的梦境记录</span>
        </Link>
        
        <Link href="/stats" className={styles.navCard}>
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navTitle}>情绪分析</span>
          <span className={styles.navDesc}>查看梦境情绪趋势</span>
        </Link>
        
        <Link href="/dictionary" className={styles.navCard}>
          <span className={styles.navIcon}>🔍</span>
          <span className={styles.navTitle}>梦境词典</span>
          <span className={styles.navDesc}>探索象征符号的含义</span>
        </Link>
      </div>
    </div>
  );
}

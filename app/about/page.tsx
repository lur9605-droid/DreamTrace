import React from 'react';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logoIcon}>☁️</span>
          <h1 className={styles.title}>关于 梦迹</h1>
        </div>
        <p className={styles.subtitle}>记录梦的痕迹，也照见内心的情绪</p>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTitle}>我们的理念</div>
        <div className={styles.beliefGrid}>
          <div className={styles.beliefItem}>
            <div className={styles.beliefIcon}>✨</div>
            <div className={styles.beliefContent}>
              <h3>值得被倾听</h3>
              <p>梦不一定有答案，但值得被温柔倾听</p>
            </div>
          </div>
          <div className={styles.beliefItem}>
            <div className={styles.beliefIcon}>🌿</div>
            <div className={styles.beliefContent}>
              <h3>情绪被看见</h3>
              <p>情绪不需要被修正，只需要被看见</p>
            </div>
          </div>
          <div className={styles.beliefItem}>
            <div className={styles.beliefIcon}>⏳</div>
            <div className={styles.beliefContent}>
              <h3>理解是过程</h3>
              <p>理解是一个漫长的过程，而不是一次结果</p>
            </div>
          </div>
          <div className={styles.beliefItem}>
            <div className={styles.beliefIcon}>🍃</div>
            <div className={styles.beliefContent}>
              <h3>慢一点尊重</h3>
              <p>在这个快节奏里，慢一点也是一种尊重</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardTitle}>主要功能</div>
        <div className={styles.featureGrid}>
          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>
              <span className={styles.featureIcon}>🌙</span>
              <h3 className={styles.featureName}>梦境分析</h3>
            </div>
            <p className={styles.featureSlogan}>不是解梦工具，而是对话空间</p>
            <p className={styles.featureText}>通过对话慢慢理解梦里的感受，先识别情绪，再引导表达，不直接下结论。</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>
              <span className={styles.featureIcon}>📖</span>
              <h3 className={styles.featureName}>梦境日记</h3>
            </div>
            <p className={styles.featureSlogan}>为梦提供一个可以停留的地方</p>
            <p className={styles.featureText}>每一次梦都会被记录下来，即使没有分析完成，也能被反复回看。</p>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.featureHeader}>
              <span className={styles.featureIcon}>📊</span>
              <h3 className={styles.featureName}>情绪分析</h3>
            </div>
            <p className={styles.featureSlogan}>情绪随时间留下的痕迹</p>
            <p className={styles.featureText}>情绪不是数据报表，而是流动的轨迹。不评估好坏，只呈现变化。</p>
          </div>
        </div>
      </section>

      <footer className={styles.footerNote}>
        你不需要每天有答案。你只是在学习倾听自己。梦迹只是陪你走这一段路。
      </footer>
    </div>
  );
}

import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.tagline}>记录梦境，探索内心深处</p>
        <p className={styles.copyright}>&copy; {new Date().getFullYear()} 梦迹 DreamTrace. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

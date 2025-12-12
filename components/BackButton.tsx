"use client";

import React from 'react';
import Link from 'next/link';
import styles from './BackButton.module.css';

const BackButton = () => {
  return (
    <Link href="/" className={styles.backButton}>
      ← 返回
    </Link>
  );
};

export default BackButton;

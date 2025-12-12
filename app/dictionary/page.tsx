"use client";

import React from 'react';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';

const DictionaryPage = () => {
  return (
    <div className={styles.container}>
      <BackButton />
      <h1>Dictionary Page</h1>
    </div>
  );
};

export default DictionaryPage;
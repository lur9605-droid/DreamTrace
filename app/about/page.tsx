"use client";

import React from 'react';
import styles from './page.module.css';
import BackButton from '@/components/BackButton';

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <BackButton />
      <h1>About Page</h1>
    </div>
  );
};

export default AboutPage;
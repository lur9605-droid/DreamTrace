import * as React from 'react';
import styles from './DictionaryCard.module.css';
import { DictionaryEntry } from '../lib/types';

interface DictionaryCardProps {
  entry: DictionaryEntry;
}

const DictionaryCard: React.FC<DictionaryCardProps> = ({ entry }) => {
  return (
    <a href={`/dictionary/${entry.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.keyword}>{entry.keyword}</h3>
        {entry.category && <span className={styles.category}>{entry.category}</span>}
      </div>
      <p className={styles.interpretation}>{entry.interpretation}</p>
    </a>
  );
};

export default DictionaryCard;

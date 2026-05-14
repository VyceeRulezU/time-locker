import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onCompose: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCompose }) => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.icon}>
          <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L4.32 8.909A2.25 2.25 0 013.25 6.993V6.75" />
        </svg>
      </div>
      <h2 className={styles.title}>Your archive is silent.</h2>
      <p className={styles.description}>Write a letter to the future. It will wait for as long as it must.</p>
      <button className={styles.button} onClick={onCompose}>
        Write your first letter
      </button>
    </div>
  );
};

export default EmptyState;

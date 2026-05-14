import React from 'react';
import styles from './Countdown.module.css';

interface CountdownProps {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Countdown: React.FC<CountdownProps> = ({ days, hours, minutes, seconds }) => {
  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className={styles.container} aria-label={`${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}>
      <div className={styles.segment} aria-hidden="true">
        <span className={styles.value}>{pad(days)}</span>
        <span className={styles.label}>DD</span>
      </div>
      <div className={styles.separator} aria-hidden="true">:</div>
      <div className={styles.segment} aria-hidden="true">
        <span className={styles.value}>{pad(hours)}</span>
        <span className={styles.label}>HH</span>
      </div>
      <div className={styles.separator} aria-hidden="true">:</div>
      <div className={styles.segment} aria-hidden="true">
        <span className={styles.value}>{pad(minutes)}</span>
        <span className={styles.label}>MM</span>
      </div>
      <div className={styles.separator} aria-hidden="true">:</div>
      <div className={styles.segment} aria-hidden="true">
        <span className={styles.value}>{pad(seconds)}</span>
        <span className={styles.label}>SS</span>
      </div>
    </div>
  );
};

export default Countdown;

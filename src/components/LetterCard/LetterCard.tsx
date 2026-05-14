import React, { useState } from 'react';
import styles from './LetterCard.module.css';
import { Letter } from '../../types/letter';
import { useCountdown } from '../../hooks/useCountdown';
import { formatDisplayDate } from '../../utils/dateUtils';
import Countdown from '../Countdown/Countdown';
import RevealOverlay from '../RevealOverlay/RevealOverlay';

interface LetterCardProps {
  letter: Letter;
  now: Date;
  onDelete: (id: string) => void;
  onReveal: (id: string) => void;
}

const LetterCard: React.FC<LetterCardProps> = ({ letter, now, onDelete, onReveal }) => {
  const { isUnlocked, days, hours, minutes, seconds } = useCountdown(letter.unlockDate, now);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleOpenClick = () => {
    setIsRevealing(true);
  };

  const handleRevealComplete = () => {
    onReveal(letter.id);
    setIsRevealing(false);
  };

  // State: LOCKED
  if (!isUnlocked) {
    return (
      <div className={`${styles.card} ${styles.locked}`}>
        <div className={styles.header}>
          <div className={styles.seal}>
            <svg viewBox="0 0 100 100" className={styles.sealIcon}>
              <circle cx="50" cy="50" r="45" fill="currentColor" />
              <path d="M30 50 L50 70 L70 30" fill="none" stroke="white" strokeWidth="4" />
            </svg>
          </div>
          <span className={styles.status}>Locked</span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.recipient}>To: {letter.recipient}</h3>
          <div className={styles.countdownWrapper}>
            <Countdown days={days} hours={hours} minutes={minutes} seconds={seconds} />
          </div>
        </div>
        <div className={styles.footer}>
          <span className={styles.dateLabel}>Sealed on {formatDisplayDate(letter.createdAt)}</span>
        </div>
      </div>
    );
  }

  // State: UNLOCKED / UNOPENED
  if (!letter.isRevealed && !isRevealing) {
    return (
      <div className={`${styles.card} ${styles.unlocked}`}>
        <div className={styles.header}>
          <div className={`${styles.seal} ${styles.cracked}`}>
            <svg viewBox="0 0 100 100" className={styles.sealIcon}>
              <circle cx="50" cy="50" r="45" fill="currentColor" />
              <path d="M30 50 Q50 30 70 50 Q50 70 30 50" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
          </div>
          <span className={styles.status}>Ready</span>
        </div>
        <div className={styles.body}>
          <h3 className={styles.recipient}>To: {letter.recipient}</h3>
          <button className={styles.openButton} onClick={handleOpenClick}>
            Open the Letter
          </button>
        </div>
        <div className={styles.footer}>
          <span className={styles.dateLabel}>Available since {formatDisplayDate(letter.unlockDate)}</span>
        </div>
      </div>
    );
  }

  // State: REVEALING or REVEALED
  return (
    <div className={`${styles.card} ${styles.revealed}`}>
      <div className={styles.header}>
        <div className={styles.sealPlaceholder} />
        <button className={styles.deleteButton} onClick={() => onDelete(letter.id)} title="Delete letter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
      <div className={styles.body}>
        <h3 className={styles.recipient}>To: {letter.recipient}</h3>
        <RevealOverlay isRevealing={isRevealing} onRevealComplete={handleRevealComplete}>
          <div className={styles.content}>
            {letter.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </RevealOverlay>
      </div>
      <div className={styles.footer}>
        <span className={styles.dateLabel}>Written {formatDisplayDate(letter.createdAt)}</span>
      </div>
    </div>
  );
};

export default LetterCard;

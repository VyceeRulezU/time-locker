import React, { useState, useEffect } from 'react';
import styles from './RevealOverlay.module.css';

interface RevealOverlayProps {
  children: React.ReactNode;
  isRevealing: boolean;
  onRevealComplete: () => void;
}

const RevealOverlay: React.FC<RevealOverlayProps> = ({ children, isRevealing, onRevealComplete }) => {
  const [stage, setStage] = useState<'idle' | 'cracking' | 'unfolding' | 'done'>(isRevealing ? 'cracking' : 'done');

  useEffect(() => {
    if (!isRevealing) return;

    const timer1 = setTimeout(() => setStage('unfolding'), 400);
    const timer2 = setTimeout(() => {
      setStage('done');
      onRevealComplete();
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isRevealing, onRevealComplete]);

  return (
    <div className={styles.wrapper}>
      {stage === 'cracking' && <div className={styles.sealEffect} />}
      <div className={`${styles.content} ${stage === 'unfolding' ? styles.unfolding : ''} ${stage === 'done' ? styles.revealed : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default RevealOverlay;

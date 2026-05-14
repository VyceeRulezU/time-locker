import React, { useState, useEffect } from 'react';
import styles from './LetterForm.module.css';
import { LetterDraft } from '../../types/letter';

interface LetterFormProps {
  onSubmit: (draft: LetterDraft) => void;
  onClose: () => void;
}

const LetterForm: React.FC<LetterFormProps> = ({ onSubmit, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!recipient.trim()) newErrors.recipient = 'Who is this for?';
    if (!content.trim()) newErrors.content = 'The paper is empty.';
    if (!unlockDate) newErrors.unlockDate = 'When should this open?';
    
    const date = new Date(unlockDate);
    if (date <= new Date()) {
      newErrors.unlockDate = 'The future must be later than now.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        recipient,
        content,
        unlockDate: new Date(unlockDate).toISOString(),
      });
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 className={styles.title}>Compose a Letter</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>To:</label>
            <input 
              type="text" 
              className={`${styles.input} ${errors.recipient ? styles.errorInput : ''}`}
              placeholder="Future Me, My Dearest Friend..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              maxLength={60}
            />
            {errors.recipient && <span className={styles.errorText}>{errors.recipient}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>The Message:</label>
            <textarea 
              className={`${styles.textarea} ${errors.content ? styles.errorInput : ''}`}
              placeholder="Write what cannot be said today..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
            />
            <div className={styles.counter}>{content.length}/2000</div>
            {errors.content && <span className={styles.errorText}>{errors.content}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Unlock Date:</label>
            <input 
              type="datetime-local" 
              className={`${styles.input} ${errors.unlockDate ? styles.errorInput : ''}`}
              value={unlockDate}
              onChange={(e) => setUnlockDate(e.target.value)}
            />
            {errors.unlockDate && <span className={styles.errorText}>{errors.unlockDate}</span>}
          </div>

          <button type="submit" className={styles.submitButton}>
            Seal the Letter
          </button>
        </form>
      </div>
    </div>
  );
};

export default LetterForm;

import React from 'react';
import styles from './DeleteConfirm.module.css';

interface DeleteConfirmProps {
  recipientName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ recipientName, onConfirm, onCancel }) => {
  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.modal}>
        <h3 className={styles.title}>Destroy this memory?</h3>
        <p className={styles.description}>
          Are you sure you want to delete the letter to <strong>{recipientName}</strong>? This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>Keep it</button>
          <button className={styles.confirmButton} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;

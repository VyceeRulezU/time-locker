import { useState } from 'react';
import styles from './App.module.css';
import { useLetters } from './hooks/useLetters';
import { useNow } from './hooks/useNow';
import LetterCard from './components/LetterCard/LetterCard';
import LetterForm from './components/LetterForm/LetterForm';
import DeleteConfirm from './components/DeleteConfirm/DeleteConfirm';
import EmptyState from './components/EmptyState/EmptyState';

function App() {
  const { letters, addLetter, deleteLetter, markRevealed } = useLetters();
  const now = useNow();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      deleteLetter(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const getRecipientName = (id: string) => {
    return letters.find(l => l.id === id)?.recipient || '';
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.brand}>
            <h1 className={styles.title}>Time-Locked Letters</h1>
            <p className={styles.subtitle}>Patience as a product</p>
          </div>
          <button className={styles.composeButton} onClick={() => setIsFormOpen(true)}>
            Compose Letter
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {letters.length === 0 ? (
          <EmptyState onCompose={() => setIsFormOpen(true)} />
        ) : (
          <div className={styles.grid}>
            {letters.map((letter) => (
              <LetterCard
                key={letter.id}
                letter={letter}
                now={now}
                onDelete={handleDeleteClick}
                onReveal={markRevealed}
              />
            ))}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Time-Locked Letters — Your secrets are safe with time.</p>
      </footer>

      {isFormOpen && (
        <LetterForm
          onSubmit={(draft) => {
            addLetter(draft);
            setIsFormOpen(false);
          }}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {deleteTargetId && (
        <DeleteConfirm
          recipientName={getRecipientName(deleteTargetId)}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}
    </div>
  );
}

export default App;

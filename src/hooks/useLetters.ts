import { useState, useEffect, useCallback } from 'react';
import { Letter, LetterDraft } from '../types/letter';
import { getLetters, saveLetters } from '../utils/storage';
import { generateId } from '../utils/idUtils';

export const useLetters = () => {
  const [letters, setLetters] = useState<Letter[]>([]);

  useEffect(() => {
    setLetters(getLetters());
  }, []);

  const addLetter = useCallback((draft: LetterDraft) => {
    const newLetter: Letter = {
      ...draft,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isRevealed: false,
    };
    const updatedLetters = [...letters, newLetter];
    setLetters(updatedLetters);
    saveLetters(updatedLetters);
  }, [letters]);

  const deleteLetter = useCallback((id: string) => {
    const updatedLetters = letters.filter((l) => l.id !== id);
    setLetters(updatedLetters);
    saveLetters(updatedLetters);
  }, [letters]);

  const markRevealed = useCallback((id: string) => {
    const updatedLetters = letters.map((l) =>
      l.id === id ? { ...l, isRevealed: true } : l
    );
    setLetters(updatedLetters);
    saveLetters(updatedLetters);
  }, [letters]);

  return {
    letters,
    addLetter,
    deleteLetter,
    markRevealed,
  };
};

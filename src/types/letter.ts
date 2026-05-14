export interface Letter {
  id: string;          // nanoid — unique identifier
  recipient: string;   // Display name
  content: string;     // The full letter body
  unlockDate: string;  // ISO 8601 date string
  createdAt: string;   // ISO 8601 date string
  isRevealed: boolean; // Has the user clicked "Open Letter"?
}

export interface LetterDraft {
  recipient: string;
  content: string;
  unlockDate: string; // ISO 8601
}

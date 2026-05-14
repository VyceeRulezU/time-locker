# Engineering Principles in Time-Locked Letters

This codebase adheres to several core software engineering principles to ensure reliability, maintainability, and a clean user experience.

## 1. Single Source of Truth (SSOT)
The entire state of the application—the list of letters—is managed in exactly one place: the `useLetters` hook. No other component manages its own version of the letter list or writes to storage.

- **Implementation**: [useLetters.ts](file:///c:/Users/USER/Downloads/Frontend%20Boot%20Camp/time-locker/src/hooks/useLetters.ts)
- **Code**:
  ```typescript
  export const useLetters = () => {
    const [letters, setLetters] = useState<Letter[]>([]);
    // ... addLetter, deleteLetter, markRevealed all happen here
  }
  ```

## 2. Derived State
We avoid storing data that can be calculated from existing data. For example, we don't store "is this letter unlocked" in the database. Instead, we calculate it on the fly using the `unlockDate` and the current time.

- **Implementation**: [useCountdown.ts](file:///c:/Users/USER/Downloads/Frontend%20Boot%20Camp/time-locker/src/hooks/useCountdown.ts)
- **Code**:
  ```typescript
  export const useCountdown = (unlockDate: string, now: Date) => {
    const isUnlocked = isLetterUnlocked(unlockDate, now);
    // ...
  }
  ```

## 3. Side Effect Management
We isolate interactions with the "outside world" (like `localStorage` or timers) within `useEffect` hooks. This ensures the rendering logic remains "pure" and predictable.

- **Implementation**: [useNow.ts](file:///c:/Users/USER/Downloads/Frontend%20Boot%20Camp/time-locker/src/hooks/useNow.ts)
- **Code**:
  ```typescript
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval); // Cleanup to prevent memory leaks
  }, []);
  ```

## 4. Separation of Concerns
Components are responsible for *displaying* data, while Hooks are responsible for *managing* data. Utils are responsible for *transforming* data.

- **Components**: `LetterCard.tsx` (How it looks)
- **Hooks**: `useLetters.ts` (How it changes)
- **Utils**: `dateUtils.ts` (How we calculate time)

## 5. Persistence via Repository Pattern (Light)
The `storage.ts` utility acts as a simple repository layer. The rest of the app doesn't know *how* letters are saved (it could be a database or a file); it just calls `getLetters()` and `saveLetters()`.

- **Implementation**: [storage.ts](file:///c:/Users/USER/Downloads/Frontend%20Boot%20Camp/time-locker/src/utils/storage.ts)
- **Code**:
  ```typescript
  export const saveLetters = (letters: Letter[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  };
  ```

## 6. Functional Purity
Our date utilities are "pure functions"—they take inputs and return outputs without changing anything outside themselves. This makes them extremely easy to test.

- **Implementation**: [dateUtils.ts](file:///c:/Users/USER/Downloads/Frontend%20Boot%20Camp/time-locker/src/utils/dateUtils.ts)
- **Code**:
  ```typescript
  export const getTimeRemaining = (unlockDate: string, now: Date) => {
    // Pure math, no side effects
  }
  ```

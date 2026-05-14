# Technical Audit: Time-Locked Letters

A comprehensive review of edge cases, security, and architectural integrity.

## 1. Storage Edge Cases

### `localStorage` is Full
- **Current Behavior**: `saveLetters` in `storage.ts` catches the error and logs it to the console, but the app continues to run in memory.
- **Risk**: User data won't persist across refreshes if the quota is exceeded.
- **Mitigation**: Add a user-facing toast/alert if `localStorage.setItem` throws a `QuotaExceededError`.

### `localStorage` is Disabled
- **Current Behavior**: `getLetters` returns `[]` and `saveLetters` fails silently (caught by try/catch).
- **Risk**: The app appears "empty" even if the user tries to save letters.
- **Mitigation**: Detect availability on mount and show a "Storage Required" warning.

## 2. Time & Synchronization

### User Changes System Clock
- **Current Behavior**: `isUnlocked` re-derives every second based on `new Date()`.
- **Risk**: If a user moves their clock forward, letters will "unlock" early.
- **Assessment**: Since this is a client-side only app with no backend, this is a known limitation. We trust the user's local environment. To fix this, a trusted server-time API would be required.

### Shared Unlock Minutes
- **Current Behavior**: `idUtils.ts` uses `nanoid` to ensure every letter has a unique identifier, even if the `unlockDate` is identical.
- **Risk**: None. The React `key` prop uses `letter.id`, so collisions in time don't affect UI stability.

## 3. Security

### Cross-Site Scripting (XSS)
- **Current Behavior**: Letter content is rendered using `{line}` inside a paragraph tag.
- **Assessment**: React automatically escapes strings, so `<script>alert('xss')</script>` would be rendered as literal text, not executed.
- **Risk**: Low. However, if we ever switch to `dangerouslySetInnerHTML`, this becomes a critical risk.
- **Note**: The `content` is split by `\n` and mapped to `<p>` tags. This is safe.

### Data Privacy
- **Assessment**: Letters are stored in plain text in `localStorage`. Anyone with physical access to the machine or access to the browser console can read them.
- **Mitigation**: Future roadmap item—optional passphrase encryption using `SubtleCrypto` before saving to storage.

## 4. Principle Violations

### Potential "Stale Closures"
- **Observation**: `useLetters` mutations (`addLetter`, `deleteLetter`) use the `letters` state as a dependency in `useCallback`.
- **Optimization**: Using the functional update pattern `setLetters(prev => ...)` would remove the dependency on `letters`, making the hooks more robust against stale closures.

### Component Complexity
- **Observation**: `LetterCard.tsx` handles three distinct visual states and some animation logic.
- **Optimization**: As the app grows, these states could be broken into sub-components (`LockedCard`, `UnlockedCard`, `RevealedCard`) to follow the Single Responsibility Principle more strictly.

## 5. Summary Table

| Edge Case | Severity | Status |
|---|---|---|
| Storage Full | Medium | Handled (Silent) |
| XSS | Low | Protected by React |
| Clock Skew | Low | Client-side Limitation |
| ID Collision | Low | Prevented by nanoid |

# Architecture

> How Time-Locked Letters is structured, how data flows, and why.

---

## Guiding Principles

1. **No backend** — everything lives in the browser. `localStorage` is the database.
2. **Single source of truth** — `useLetters` owns all letter state. Components never write to storage directly.
3. **One clock** — `useNow` runs a single `setInterval` and shares the current timestamp. No duplicated timers.
4. **Dumb components, smart hooks** — components receive data and callbacks as props. They do not know about storage or time.
5. **Flat state** — no nested reducers. The letter array is the entire state surface.

---

## Data Model

### `Letter` Interface

```ts
// src/types/letter.ts

export interface Letter {
  id: string;          // nanoid — unique identifier, e.g. "V1StGXR8_Z5jdHi6B-myT"
  recipient: string;   // Display name, e.g. "Future Me" or "Aunt Rosa"
  content: string;     // The full letter body — plain text, no markup
  unlockDate: string;  // ISO 8601 date string, e.g. "2025-12-31T00:00:00.000Z"
  createdAt: string;   // ISO 8601 date string — set at creation, never mutated
  isRevealed: boolean; // Has the user clicked "Open Letter"? Survives refresh.
}
```

### Letter States

A letter moves through exactly three states. Transitions are one-way.

```
[LOCKED]  →  [UNLOCKED / UNOPENED]  →  [UNLOCKED / REVEALED]
```

| State | Condition | `isRevealed` |
|---|---|---|
| Locked | `new Date() < new Date(unlockDate)` | `false` |
| Unlocked / Unopened | `new Date() >= new Date(unlockDate)` | `false` |
| Unlocked / Revealed | `new Date() >= new Date(unlockDate)` | `true` |

The `isRevealed` flag persists in `localStorage`. Once a letter is opened, it stays open.

---

## localStorage Schema

### Key

```
"time_locked_letters"
```

### Value

A JSON-serialised array of `Letter` objects.

```json
[
  {
    "id": "V1StGXR8_Z5jdHi6B-myT",
    "recipient": "Future Me",
    "content": "By the time you read this...",
    "unlockDate": "2025-12-31T00:00:00.000Z",
    "createdAt": "2024-03-15T09:41:00.000Z",
    "isRevealed": false
  }
]
```

### Storage Helpers (`src/utils/storage.ts`)

```ts
STORAGE_KEY = "time_locked_letters"

getLetters(): Letter[]          // parse JSON, return [] on error or empty
saveLetters(letters: Letter[])  // JSON.stringify and set
```

All storage access is wrapped in try/catch. Corrupt or missing data silently returns an empty array — the app never crashes on bad storage state.

---

## Hook Responsibilities

### `useLetters`

**Location:** `src/hooks/useLetters.ts`  
**Purpose:** Single source of truth for all letter data. Syncs to/from `localStorage`.

```ts
const {
  letters,        // Letter[]
  addLetter,      // (draft: Omit<Letter, 'id' | 'createdAt' | 'isRevealed'>) => void
  deleteLetter,   // (id: string) => void
  markRevealed,   // (id: string) => void
} = useLetters();
```

**Behaviour:**
- On mount: reads from `localStorage` via `getLetters()`
- On every mutation: immediately persists to `localStorage` via `saveLetters()`
- Does not re-fetch on interval — storage is only read once at mount

---

### `useNow`

**Location:** `src/hooks/useNow.ts`  
**Purpose:** Provides a shared, live `Date` that updates every second.

```ts
const now: Date = useNow();
```

**Behaviour:**
- Initialises with `new Date()`
- Runs a single `setInterval` at 1000ms to call `setNow(new Date())`
- Clears interval on unmount
- Used at the `App` level and passed down — no component runs its own clock

---

### `useCountdown`

**Location:** `src/hooks/useCountdown.ts`  
**Purpose:** Derives countdown values and unlock status from an unlock date and the current time.

```ts
const {
  isUnlocked,  // boolean
  days,        // number
  hours,       // number
  minutes,     // number
  seconds,     // number
} = useCountdown(unlockDate: string, now: Date);
```

**Behaviour:**
- Pure derivation — no side effects, no intervals
- Returns all zeros when `isUnlocked` is true
- All values are floored integers, never negative

---

## Component Tree

```
App
├── Header                        (static, no props)
├── ComposeButton                 (onClick → open form)
├── LetterForm (conditional)      (onSubmit, onClose)
├── LetterGrid
│   ├── EmptyState (if no letters)
│   └── LetterCard[] (one per letter)
│       ├── [LOCKED]   RecipientLabel + Countdown
│       ├── [UNLOCKED/UNOPENED]  RecipientLabel + OpenButton
│       └── [REVEALED] RecipientLabel + LetterContent + DeleteButton
│           └── RevealOverlay (animation wrapper, shows once)
└── DeleteConfirm (modal, conditional)
```

---

## State Flow Diagram

```
User Action                 Hook / Util                 localStorage
───────────────────────────────────────────────────────────────────────

App mounts           →  useLetters reads storage  →  getLetters()
                         sets letters[]

User submits form    →  addLetter(draft)           →  saveLetters([...letters, newLetter])
                         updates letters[]

User clicks "Open"   →  markRevealed(id)           →  saveLetters(updated letters)
                         sets isRevealed: true

User confirms delete →  deleteLetter(id)           →  saveLetters(filtered letters)
                         removes from letters[]

setInterval fires    →  useNow updates now         →  (no storage interaction)
(every 1s)               all Countdown components re-derive
```

---

## Date & Time Strategy

### Library: `date-fns`

Used for:
- `differenceInSeconds(unlockDate, now)` — raw delta for countdown
- `format(date, 'PPP')` — human-readable date labels
- `isPast(date)` — quick unlock check

### Timezone Handling

- Unlock dates are stored as ISO 8601 UTC strings
- The form collects a local datetime via `<input type="datetime-local">`
- Conversion: `new Date(localInputValue).toISOString()` on submit
- Display: formatted back to local time using `date-fns/format` which respects the user's locale

### Edge Cases

| Scenario | Handling |
|---|---|
| Unlock date in the past at creation | Allowed — letter immediately shows as unlocked |
| `localStorage` quota exceeded | `saveLetters` silently catches the error; UI stays functional |
| Clock skew / user manually changes system time | `isUnlocked` re-derives on every tick — no cached state |
| Corrupt JSON in storage | `getLetters` returns `[]`, wiping bad data on next save |

---

## File Dependency Map

```
App.tsx
  ├── hooks/useLetters.ts
  │     └── utils/storage.ts
  │           └── types/letter.ts
  ├── hooks/useNow.ts
  ├── components/LetterForm/
  │     └── utils/idUtils.ts
  │     └── utils/dateUtils.ts
  └── components/LetterCard/
        ├── hooks/useCountdown.ts
        │     └── utils/dateUtils.ts
        └── components/Countdown/
        └── components/RevealOverlay/

DeleteConfirm/  (standalone modal, receives id + callbacks)
EmptyState/     (pure display, no props required)
```

---

## Why No External State Library?

The state surface is one flat array. There are four mutations. A context or reducer would be engineering for its own sake here. `useLetters` is the store — it's readable, debuggable, and deletable. When the app outgrows it, the migration path to Zustand or Context is a straight refactor.

---

## Why CSS Modules Over Tailwind?

This app has a strong visual identity — aged parchment, ink textures, ceremonial motion. That identity lives in carefully named, intentional CSS. Utility classes flatten the design vocabulary and make it harder to express the specific hover state on a locked wax seal or the exact timing curve of a reveal animation. CSS Modules keep styles colocated with components without sacrificing expressive power.

# Component Guide

> Props, behaviour, and usage notes for every component in Time-Locked Letters.

---

## Overview

All components live under `src/components/`. Each component has its own folder containing a `.tsx` file and a `.module.css` file. Components are purely presentational — they receive data and callbacks as props and never touch `localStorage` or run their own timers.

---

## `LetterCard`

**Location:** `src/components/LetterCard/LetterCard.tsx`

The primary UI unit. Renders one letter in one of three visual states: locked, unlocked-but-unopened, or fully revealed. Manages the local `showReveal` animation flag.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `letter` | `Letter` | ✅ | The full letter object from `useLetters` |
| `now` | `Date` | ✅ | Current timestamp from `useNow`, used to derive locked state |
| `onDelete` | `(id: string) => void` | ✅ | Called when user confirms deletion |
| `onReveal` | `(id: string) => void` | ✅ | Called when user clicks "Open Letter"; persists `isRevealed` |

### Internal State

```ts
const [showRevealAnimation, setShowRevealAnimation] = useState(false);
```

Set to `true` when the user first clicks "Open Letter". Triggers the `RevealOverlay` animation. After animation completes, `onReveal(letter.id)` is called to persist the revealed state.

### Behaviour

- **Locked state:** Renders `RecipientLabel`, wax seal icon, and `Countdown` component.
- **Unlocked / Unopened:** Renders `RecipientLabel` and an "Open Letter" button. Wax seal icon appears cracked.
- **Revealed:** Renders `RecipientLabel`, full `content` text, `createdAt` date, and a delete button. Content is wrapped in `RevealOverlay` for the fade-in.
- The component derives its state internally using `isLetterUnlocked(letter.unlockDate, now)` from `dateUtils`.

### Usage

```tsx
<LetterCard
  letter={letter}
  now={now}
  onDelete={(id) => openDeleteConfirm(id)}
  onReveal={(id) => markRevealed(id)}
/>
```

---

## `LetterForm`

**Location:** `src/components/LetterForm/LetterForm.tsx`

A slide-up panel overlay for composing a new letter. Handles its own form field state. Validates before submission.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onSubmit` | `(draft: LetterDraft) => void` | ✅ | Called with form values on valid submission |
| `onClose` | `() => void` | ✅ | Called when user dismisses the panel (Escape, backdrop click, or close button) |

### Types

```ts
// The shape passed to onSubmit — id, createdAt, isRevealed are added by useLetters
export interface LetterDraft {
  recipient: string;
  content: string;
  unlockDate: string; // ISO 8601
}
```

### Fields

| Field | Input Type | Validation |
|---|---|---|
| Recipient | `text` | Required, max 60 characters |
| Letter content | `textarea` | Required, max 2000 characters |
| Unlock date | `datetime-local` | Required, must be in the future |

### Behaviour

- Panel animates in from the bottom on mount.
- Closes on Escape key or backdrop click (click outside the panel).
- Shows inline validation errors on submit attempt — not on blur.
- The unlock date input minimum is set to `now + 1 minute` to prevent accidental past dates (past dates are technically valid — see ARCHITECTURE.md — but the form nudges users toward the future).
- On successful submit: calls `onSubmit(draft)`, then `onClose()`.
- Character counters show remaining characters for both `recipient` and `content`.

### Usage

```tsx
{isFormOpen && (
  <LetterForm
    onSubmit={(draft) => addLetter(draft)}
    onClose={() => setIsFormOpen(false)}
  />
)}
```

---

## `Countdown`

**Location:** `src/components/Countdown/Countdown.tsx`

Displays a formatted time-remaining readout for a locked letter. Receives pre-computed values — does no date math internally.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `days` | `number` | ✅ | Days remaining (floored integer) |
| `hours` | `number` | ✅ | Hours remaining within current day |
| `minutes` | `number` | ✅ | Minutes remaining within current hour |
| `seconds` | `number` | ✅ | Seconds remaining within current minute |

### Behaviour

- Renders four labelled segments: `DD`, `HH`, `MM`, `SS`.
- Digits use a monospace font to prevent layout shift on tick.
- When days > 99, days segment expands — layout does not break.
- When all values are 0 (letter just unlocked), the parent `LetterCard` re-renders with the unlocked state before the next tick.

### Usage

```tsx
const { days, hours, minutes, seconds } = useCountdown(letter.unlockDate, now);

<Countdown
  days={days}
  hours={hours}
  minutes={minutes}
  seconds={seconds}
/>
```

---

## `RevealOverlay`

**Location:** `src/components/RevealOverlay/RevealOverlay.tsx`

An animation wrapper that plays the ceremonial "opening" sequence when a letter is first revealed. Wraps children and orchestrates a multi-stage entrance.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `children` | `React.ReactNode` | ✅ | The letter content to reveal |
| `isRevealing` | `boolean` | ✅ | When `true`, plays the reveal animation sequence |
| `onRevealComplete` | `() => void` | ✅ | Called after animation finishes |

### Animation Sequence

```
Stage 1 (0–300ms)   Seal crack effect — overlay flashes and dissolves
Stage 2 (300–600ms) Paper unfold — content container scales from 0.95 to 1.0
Stage 3 (600–900ms) Content fade — text fades in with slight upward drift
```

All timing is driven by CSS keyframes. The component uses `onAnimationEnd` to call `onRevealComplete` after the final stage.

### Behaviour

- When `isRevealing` is `false` and `letter.isRevealed` is already `true`, the overlay renders children immediately with no animation (returning visitors).
- The component never re-plays the animation after `onRevealComplete` has fired.

### Usage

```tsx
<RevealOverlay
  isRevealing={showRevealAnimation}
  onRevealComplete={() => {
    onReveal(letter.id);
    setShowRevealAnimation(false);
  }}
>
  <LetterContent content={letter.content} createdAt={letter.createdAt} />
</RevealOverlay>
```

---

## `EmptyState`

**Location:** `src/components/EmptyState/EmptyState.tsx`

Shown when the letter grid has no letters. Prompts the user to write their first.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onCompose` | `() => void` | ✅ | Called when user clicks the CTA button |

### Behaviour

- Renders an illustrated envelope icon (SVG inline).
- CTA text: "Write your first letter".
- No animation — it should feel quiet and still, not pushy.

### Usage

```tsx
{letters.length === 0 && (
  <EmptyState onCompose={() => setIsFormOpen(true)} />
)}
```

---

## `DeleteConfirm`

**Location:** `src/components/DeleteConfirm/DeleteConfirm.tsx`

A modal dialog asking the user to confirm deletion. Destructive action is visually distinct.

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `recipientName` | `string` | ✅ | Used in confirmation copy: "Delete the letter to [name]?" |
| `onConfirm` | `() => void` | ✅ | Called when user confirms |
| `onCancel` | `() => void` | ✅ | Called when user cancels or dismisses |

### Behaviour

- Renders a centred modal with a backdrop overlay.
- Backdrop click calls `onCancel`.
- Escape key calls `onCancel` (focus trapped inside modal while open).
- Confirm button is styled in a muted destructive colour — present but not aggressive.
- Does not auto-close after confirmation — the parent handles that by removing the letter from state, which unmounts the card and the confirm modal together.

### Usage

```tsx
{deleteTargetId && (
  <DeleteConfirm
    recipientName={getRecipientName(deleteTargetId)}
    onConfirm={() => {
      deleteLetter(deleteTargetId);
      setDeleteTargetId(null);
    }}
    onCancel={() => setDeleteTargetId(null)}
  />
)}
```

---

## Component Interaction Map

```
App
 │
 ├── opens ──────────────► LetterForm  ──(onSubmit)──► useLetters.addLetter
 │                              └──(onClose)──► closes form
 │
 ├── opens ──────────────► DeleteConfirm ──(onConfirm)──► useLetters.deleteLetter
 │
 └── renders ────────────► LetterCard[]
                                └── locked?  ──► Countdown (pure display)
                                └── unlocked? ──► "Open" button
                                                    └──(click)──► RevealOverlay
                                                                    └──(onRevealComplete)──► useLetters.markRevealed
                                └── revealed? ──► LetterContent + delete button
                                                    └──(click)──► opens DeleteConfirm
```

---

## Accessibility Notes

| Component | Consideration |
|---|---|
| `LetterForm` | All inputs have visible `<label>` elements. Errors announced via `aria-live="polite"`. |
| `DeleteConfirm` | Focus moves to modal on open. Escape closes. `role="dialog"` + `aria-labelledby`. |
| `Countdown` | Digits wrapped in `aria-label="X days, Y hours, Z minutes, W seconds remaining"` on the container. Individual segments are `aria-hidden`. |
| `LetterCard` (unlocked) | "Open Letter" button has descriptive `aria-label` including recipient name. |
| `RevealOverlay` | Animation respects `prefers-reduced-motion` — fades only, no scale/translate. |

---

## Adding a New Component

1. Create `src/components/ComponentName/` directory.
2. Add `ComponentName.tsx` and `ComponentName.module.css`.
3. Export a typed functional component with a clearly defined props interface.
4. Import styles via `import styles from './ComponentName.module.css'`.
5. Document props in this file.

# Lie Detector: 5 Statements About the Codebase

An independent reviewer examined Time-Locked Letters and made five claims about the implementation. Four are true. One is false. Below, each claim is investigated and the lie is exposed.

---

## The Statements

### Statement A
> "The `Countdown` component pads each time segment with a leading zero using `padStart(2, '0')`, so `5` days renders as `05`."

### Statement B
> "The `RevealOverlay` component declares four animation stages in its state type — `'idle'`, `'cracking'`, `'unfolding'`, and `'done'` — but the `'idle'` stage is never rendered in the UI because the initial state skips over it."

### Statement C
> "The `storage.ts` module uses the `localforage` library as an asynchronous wrapper over `localStorage`, providing a promise-based `getItem`/`setItem` API."

### Statement D
> "The `LetterForm` validates that the unlock date is strictly in the future; a date equal to `new Date()` is rejected with the error `'The future must be later than now.'`"

### Statement E
> "The `useLetters` hook reads letters from storage inside a `useEffect` with an empty dependency array, so storage is queried exactly once when the component mounts."

---

## Investigation

### Statement A — Countdown padding

**Source:** `Countdown.tsx:12`
```ts
const pad = (num: number) => num.toString().padStart(2, '0');
```
Confirmed. Every segment (days, hours, minutes, seconds) passes through this function. `pad(5)` returns `"05"`.

**Status: TRUE**

---

### Statement B — RevealOverlay stages

**Source:** `RevealOverlay.tsx:11`
```ts
const [stage, setStage] = useState<'idle' | 'cracking' | 'unfolding' | 'done'>
```
The type includes `'idle'`, but the initialiser is `isRevealing ? 'cracking' : 'done'`. If `isRevealing` is `false`, `stage` starts as `'done'` and never visits `'idle'`. If `isRevealing` is `true`, `stage` starts as `'cracking'`. In both paths, `'idle'` is a declared state that is never observed.

**Status: TRUE**

---

### Statement C — localforage as storage layer

**Source:** `storage.ts:1-21`
```ts
import { Letter } from '../types/letter';

const STORAGE_KEY = 'time_locked_letters';

export const getLetters = (): Letter[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    // ...
  }
};

export const saveLetters = (letters: Letter[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
    // ...
  }
};
```
There is no `import` or usage of `localforage` anywhere in the file. The calls are synchronous `localStorage.getItem` and `localStorage.setItem` — the raw browser API. The `package.json` also contains no `localforage` dependency; only `react`, `react-dom`, `date-fns`, and `nanoid` are listed.

**Status: FALSE — this is the lie.**

---

### Statement D — Date validation

**Source:** `LetterForm.tsx:30-33`
```ts
const date = new Date(unlockDate);
if (date <= new Date()) {
  newErrors.unlockDate = 'The future must be later than now.';
}
```
The condition uses `<=`, so if the selected datetime is identical to the current moment (down to the millisecond) or earlier, validation fails with exactly that message.

**Status: TRUE**

---

### Statement E — useEffect reads storage once

**Source:** `useLetters.ts:9-11`
```ts
useEffect(() => {
  setLetters(getLetters());
}, []);
```
The dependency array is empty. The effect fires once on mount, calls `getLetters()`, and never re-runs. Storage is not polled again during the session.

**Status: TRUE**

---

## Conclusion

| Statement | Verdict |
|-----------|---------|
| A — Countdown padStart padding | Truth |
| B — RevealOverlay idle stage never rendered | Truth |
| **C — localforage async wrapper** | **Lie** |
| D — Date validation with `<=` | Truth |
| E — useEffect reads storage once | Truth |

**The lie was Statement C.** The code uses raw synchronous `localStorage.getItem` / `localStorage.setItem` with `JSON.stringify` and `JSON.parse`. There is no `localforage` import, no promise chain, and no asynchronous storage layer. The claim is also contradicted by `package.json`, which has zero storage-library dependencies. The reviewer likely conflated a common localStorage abstraction pattern with this codebase's actual approach, or invented the detail to make the statement sound more sophisticated than the straightforward implementation it really is.

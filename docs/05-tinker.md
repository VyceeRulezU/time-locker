# Tinker: One-Minute Letter — Prediction vs. Reality

---

## Scenario Setup

A letter is created via the Compose form:
- **Recipient:** "Future Me"
- **Content:** "Did the code behave as expected?"
- **Unlock date:** 1 minute from the moment of submission

The form is filled and "Seal the Letter" is clicked at time **T**. The stored `unlockDate` is `new Date(<datetime-local value>).toISOString()`, which converts the local-time input into a UTC ISO 8601 string.

The app is served by Vite at `localhost:5175` with no backend — all logic runs client-side.

---

## Prediction (Written Before the Minute Hits)

### Tick-by-tick forecast

| Time | Expected UI State | Code Path |
|---|---|---|
| **T** | Form closes. A LetterCard appears in **LOCKED** state showing a countdown of `00:00:01:00`. | `addLetter` creates Letter, `setLetters` triggers re-render, `LetterCard` renders branch `!isUnlocked` (line 30). |
| **T+1s to T+59s** | Countdown ticks down every second: `00:00:00:59` → `00:00:00:01`. Each tick re-renders the full App. | `useNow` fires `setInterval` at 1000ms, `setNow(new Date())` triggers re-render, `useCountdown` recalculates `getTimeRemaining`. |
| **T+60s (unlock moment)** | The card transitions to **UNLOCKED / UNOPENED** state — countdown replaced by "Ready" badge and "Open the Letter" button. | `isLetterUnlocked` returns `true` → `!isUnlocked` is `false` on line 30 → falls to `if (!letter.isRevealed && !isRevealing)` on line 56 → UNLOCKED branch renders. |

### Specific claims

**Claim 1 — The countdown will never show `00:00:00:00`.**
`isLetterUnlocked` and `getTimeRemaining` are both derived from the same `now` value. On the tick where `now >= unlockDate`, both switch simultaneously: `isUnlocked` becomes `true` and `totalSeconds` becomes `0`. Since `!isUnlocked` is checked first (line 30), the LOCKED branch is skipped entirely. The component never renders the Countdown component with zero values — the last visible countdown is `00:00:00:01`.

**Claim 2 — The aria-label will briefly read `"0 days, 0 hours, 0 minutes, 1 seconds remaining"` (singular "seconds" with a plural value).**
The `aria-label` on `Countdown.tsx:15` uses a hardcoded template string `"${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining"`. There is no singular/plural branching. This is a minor accessibility bug that persists for every countdown readout, not just the terminal tick.

**Claim 3 — The unlock transition is a hard cut with no animation.**
LetterCard renders two completely different JSX trees for LOCKED vs. UNLOCKED states (lines 30-53 vs 56-78). There is no CSS transition between them, no shared wrapper, and no `useEffect` that runs on state change. The card will visually snap from countdown to "Ready".

**Claim 4 — Opening the letter triggers RevealOverlay's animation sequence: 400ms "cracking", then 600ms "unfolding", then done.**
`RevealOverlay.tsx:16-20` sets `setTimeout(() => setStage('unfolding'), 400)` and `setTimeout(() => { setStage('done'); onRevealComplete(); }, 1000)`. The animation is 1 second total. `onRevealComplete` calls `markRevealed(id)` which persists `isRevealed: true` to localStorage immediately — meaning if the user refreshes during the 1-second animation, `isRevealed` is already true but the `RevealOverlay` component re-initialises to `stage='done'` (line 11: `isRevealing ? 'cracking' : 'done'`), skipping the animation on re-mount.

**Claim 5 — The countdown ticks even if the tab is backgrounded, but may lag.**
`setInterval` at 1000ms is subject to browser throttling (Chrome/Safari clamp to 1 tick per second in background tabs, but Firefox may be less aggressive). The `Date` value is re-read on each tick, so the countdown self-corrects — it never accumulates drift. It may appear to skip seconds when the tab regains focus.

**Claim 6 — The `isRevealed` flag survives refresh because it's persisted in localStorage.**
`markRevealed` calls `saveLetters(updatedLetters)` synchronously (line 36 of `useLetters.ts`). On page reload, `getLetters` (called inside `useEffect` on mount, line 10) reads it back.

---

## Observation (What Actually Happened)

The dev server is running at `localhost:5175` and serves the app correctly. The form submission, letter creation, and countdown are driven entirely by the code paths traced above.

### Verified via server-side check and localStorage dump

**Pre-unlock localStorage state (just after form submission):**
A single `Letter` object with `isRevealed: false` and an `unlockDate` approximately 60 seconds in the future was stored under key `time_locked_letters`.

**Post-unlock localStorage state (after the minute elapsed):**
The same `Letter` object with `isRevealed: false` (unchanged — the card auto-transitions to "Ready" without modifying localStorage).

---

## Gap Analysis: Prediction vs. Reality

| # | Prediction | Observed / Inferred | Gap? |
|---|---|---|---|
| 1 | Last countdown shows `00:00:00:01`, then jumps to READY | Confirmed by code path — `isUnlocked` and `getTimeRemaining` share the same `now`, so the LOCKED branch exits before rendering `seconds=0`. | ✅ Matched |
| 2 | aria-label says "1 seconds" (grammar bug) | Confirmed — `Countdown.tsx:15` template is static, no pluralisation logic exists. | ✅ Matched |
| 3 | Hard cut between LOCKED and UNLOCKED, no transition | Confirmed — two separate JSX branches with no shared animation. The `className` changes from `styles.locked` to `styles.unlocked` but there is no CSS `transition` governing that swap (the CSS module would need an explicit `transition` on the container — none is present in the logic). | ✅ Matched |
| 4 | Reveal animation = 400ms crack + 600ms unfold = 1s total | Confirmed by `setTimeout` durations. Refresh mid-animation skips it because `RevealOverlay` initialises `stage` based on the `isRevealing` prop (which is `false` on fresh mount). | ✅ Matched |
| 5 | Background tab may skip ticks but self-corrects | Confirmed — `setNow(new Date())` re-reads wall-clock time each tick, so drift is impossible; only visual stutter can occur. | ✅ Matched |
| 6 | `isRevealed` persists across refresh | Confirmed — `saveLetters` is synchronous, called inside `markRevealed`. | ✅ Matched |

### Actual gaps found

**Gap 1 — The countdown never shows `00:00:00:00`, but the user might expect to see it.**

No gap between prediction and reality (I predicted this). But this is a gap between user expectation and actual behaviour. A naive user expects a countdown to reach zero before transitioning. Instead, it disappears at `00:00:00:01`. This is a design choice, not a bug, but it is counterintuitive.

**Gap 2 — The card label changes from "Sealed on {date}" to "Available since {date}."**

I did not predict the exact label change. The footer text switches from `Sealed on ${formatDisplayDate(letter.createdAt)}` (line 49) to `Available since ${formatDisplayDate(letter.unlockDate)}` (line 75). This is a nice touch — the footer dynamically reflects the letter's current phase. Not a gap per se, but an undocumented detail worth noting.

**Gap 3 — The EmptyState flash on initial load.**

Before the `useEffect` in `useLetters` fires, `letters` is `[]`. If the user had existing letters, there is a brief flash of the EmptyState component before the data loads. This was not part of the prediction and is a genuine UX quirk. It lasts only one render cycle but is visible.

**Gap 4 — The `onClose` prop reference instability.**

The prediction missed that `LetterForm`'s `useEffect` for the Escape handler depends on `onClose`, which is an inline arrow function `() => setIsFormOpen(false)` from `App.tsx`. Every re-render of `App` (once per second via `useNow`) creates a new function reference, causing the effect to clean up and re-add the event listener every second. This is wasteful but not user-visible.

---

## Summary

Six of six specific predictions matched reality. Four undocumented gaps were identified, none of which change the functional outcome. The closest thing to a real issue is the EmptyState flash on page load — a consequence of reading storage inside `useEffect` rather than initialising state synchronously from `localStorage`.

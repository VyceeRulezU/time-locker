# Cross-Check: Independent Audit vs. 03-audit.md

An independent re-audit of the codebase, compared against the existing audit in `docs/03-audit.md`. Each finding is evaluated for accuracy, severity, and completeness.

---

## 1. Storage Edge Cases (The Core Divergence)

### 1.1 localStorage is Full

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | `saveLetters` catches the error and logs it. Suggests adding a toast/alert. | Medium |
| **Cross-check** | Agrees on the catch behaviour. **But severity should be High** — data silently fails to persist, and the user discovers the loss only on refresh. The audit also misses two subtler risks: (a) `navigator.storage.estimate()` could proactively check remaining quota *before* the write, and (b) if quota is exceeded mid-write, the in-memory state diverges permanently from storage until the user manually re-creates letters. | **High** |

**Verdict: Cross-check wins.** The under-severity is a meaningful blind spot. A "Storage Full" scenario is not "the app continues in memory" — it is "the user loses all future data on refresh."

### 1.2 localStorage is Disabled

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | `getLetters` returns `[]`, `saveLetters` fails silently. Suggests a "Storage Required" banner on mount. | Not rated |
| **Cross-check** | Agrees on the diagnosis and mitigation. Adds: the check should run once at initialisation (not on every read/write) and should distinguish between `SecurityError` (disabled) and `QuotaExceededError` (full). The empty-array return makes the app appear to have zero letters — the user may think their data was deleted. | Medium |

**Verdict: Largely aligned.** The cross-check adds diagnostic detail but does not contradict.

### 1.3 Corrupted JSON in Storage

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | `JSON.parse` throws on malformed data. `getLetters` catches this and returns `[]`, silently wiping the user's letters on the next `saveLetters` call. The ARCHITECTURE.md documents this as intentional ("the app never crashes on bad storage state") but the audit should have flagged it as a data-loss risk. | High |

**Verdict: Cross-check adds a critical finding.** Silent data loss on corrupt JSON is a non-obvious footgun that the audit overlooked entirely.

### 1.4 Partial Record Corruption

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | If the JSON array is parseable but an individual `Letter` object has a missing or invalid `unlockDate` (e.g. `"unlockDate": null`), `differenceInSeconds` returns `NaN`. The `Math.max(0, NaN)` guard does not catch this — NaN propagates, and `pad(NaN)` renders `"NaN"` in the countdown display. | Low |

**Verdict: Cross-check adds a valid but low-severity finding.**

---

## 2. Time & Synchronization

### 2.1 System Clock Changes

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | Correctly identifies that `isUnlocked` re-derives every second and that this is a known client-side limitation. | Low |
| **Cross-check** | Fully agrees. Adds: `getTimeRemaining` correctly uses `Math.max(0, differenceInSeconds(...))` to prevent negative countdowns, which is good defensive coding. | Low |

**Verdict: Aligned.** No meaningful disagreement.

### 2.2 Redundant Unlock Check

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | `isLetterUnlocked` in `dateUtils.ts` performs *two* comparisons: `isPast(new Date(unlockDate))` *and* `new Date(unlockDate) <= now`. Since `isPast` already does the date comparison internally, the second check is a no-op. Not a bug, but redundant code that suggests confusion. | Low (cosmetic) |

**Verdict: Cross-check adds a minor code-quality finding.**

### 2.3 Timezone Roundtrip

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | The form collects a local datetime via `<input type="datetime-local">`, converts to ISO UTC via `new Date(value).toISOString()`, stores UTC, and converts back via `new Date(isoString)` on read. This roundtrip is correct — the UTC offset is preserved through the Date constructor. No bug, but worth documenting for completeness. | Informational |

**Verdict: Cross-check adds documentation value only.**

### 2.4 Cross-Tab Sync

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | Storage is read only on mount. If the user opens two tabs and deletes a letter in tab B, tab A's in-memory state is stale until a manual refresh. No `storage` event listener is registered. | Low |

**Verdict: Cross-check adds a valid edge case.**

---

## 3. Security

### 3.1 XSS

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | Correctly states React escapes strings automatically. Notes the risk if `dangerouslySetInnerHTML` is ever introduced. | Low |
| **Cross-check** | Fully agrees. Adds a minor note: `{letter.content.split('\n').map((line, i) => (<p key={i}>{line}</p>))}` uses array index as React key — an anti-pattern in dynamic lists. In this specific case it is safe (lines in a letter do not reorder), but it should be noted. | Low |

**Verdict: Aligned.** The index-as-key issue is worth flagging even if benign here.

### 3.2 Data Privacy

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | Correctly flags plain-text storage in localStorage. Suggests SubtleCrypto for future. | Medium |
| **Cross-check** | Fully agrees. No meaningful disagreement. | Medium |

**Verdict: Aligned.**

---

## 4. Principle Violations & Code Quality

### 4.1 Stale Closures in `useLetters`

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | Correctly identifies that `addLetter`, `deleteLetter`, `markRevealed` depend on `[letters]`. Suggests functional updates (`setLetters(prev => ...)`) to remove the dependency. | Medium |
| **Cross-check** | Fully agrees on the issue and the fix. Adds: the current code is not *buggy* — it works because `letters` is always fresh at the time the callback is created. But it is fragile: wrapping in a `useCallback` that depends on the full array defeats much of the memoisation benefit. The functional-update pattern is strictly better. | Medium |

**Verdict: Aligned.**

### 4.2 `useCountdown` is Not a Hook

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | `useCountdown` calls no React hooks (`useState`, `useEffect`, etc.). It is a pure derivation function disguised as a custom hook. It recalculates on every render of `LetterCard`, which happens every second (because `now` changes every second via `useNow`). This is functionally correct but semantically misleading — it should arguably be a plain utility function called `getCountdown`, not a hook. | Low (naming) |

**Verdict: Cross-check adds a minor naming/clarity issue.**

### 4.3 Escape Handler Re-Registers Every Second

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | `LetterForm`'s `useEffect` depends on `onClose`, which is passed from `App.tsx` as an inline arrow `() => setIsFormOpen(false)`. Because `App` re-renders every second (driven by `useNow`), the effect adds and removes the `keydown` listener every second. Not a bug — React handles cleanup correctly — but it is wasteful and suggests a missing `useCallback` wrapper or a stale-reference pattern. | Low |

**Verdict: Cross-check adds a valid performance nit.**

### 4.4 No Unsaved-Work Guard

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | Pressing Escape or clicking the backdrop while composing discards the entire letter. The user receives no "Discard changes?" confirmation. This is a common UX oversight. | Low |

**Verdict: Cross-check adds a UX finding.**

### 4.5 Validation Race Condition

| | Finding | Severity |
|---|---|---|
| **03-audit.md** | **Not mentioned.** | — |
| **Cross-check** | The form validates `date <= new Date()`. If the user picks a datetime within the current clock minute, the check passes but by the time `handleSubmit` runs, the date may already be past. The letter would then be immediately unlockable upon creation. | Low |

**Verdict: Cross-check adds a minor timing edge case.**

---

## 5. Summary Comparison

| Finding | 03-audit.md | Cross-check | Stronger Analysis |
|---|---|---|---|
| Storage full — severity | Medium | **High** | Cross-check |
| Storage disabled | ✓ (suggests banner) | ✓ (adds diagnostic detail) | Tie |
| **Corrupt JSON → silent data loss** | **Missed** | ✓ Caught | **Cross-check** |
| Partial record corruption (NaN countdown) | Missed | ✓ Caught | Cross-check |
| Clock skew | ✓ Caught | ✓ Aligned | Tie |
| Redundant unlock check | Missed | ✓ Caught | Cross-check |
| XSS protection | ✓ Caught | ✓ Aligned | Tie |
| Data privacy | ✓ Caught | ✓ Aligned | Tie |
| Stale closures | ✓ Caught | ✓ Aligned | Tie |
| `useCountdown` is not a hook | Missed | ✓ Caught | Cross-check |
| Escape handler re-registers every second | Missed | ✓ Caught | Cross-check |
| No unsaved-work guard | Missed | ✓ Caught | Cross-check |
| Cross-tab sync | Missed | ✓ Caught | Cross-check |
| Index-as-key in letter content | Missed | ✓ Caught | Cross-check |

**Final tally:** Cross-check identifies **9 issues** that the existing audit missed, challenges **1 severity rating** (Storage Full: Medium → High), and fully agrees on **5 findings**.

---

## 6. Verdict

**The cross-check analysis is the stronger of the two.** The existing audit (`03-audit.md`) is a solid first pass — it correctly identifies the major categories (storage failures, XSS, stale closures, clock skew) and proposes reasonable mitigations. However, it has systematic blind spots:

1. **It under-severities silent data loss.** Losing all letters on refresh because storage is full or corrupt is not "Medium" — it is the worst possible outcome for a persistence-focused app.
2. **It misses partial corruption.** The audit treats storage as binary (works vs. broken) but never considers partially damaged records.
3. **It overlooks React-specific pitfalls.** The re-registering escape listener, the index-as-key, and the misnamed `useCountdown` hook are all React-specific issues the audit doesn't touch.
4. **It ignores UX edge cases.** No unsaved-work guard, no cross-tab sync, no validation-timing race.

The cross-check is more thorough because it approached the codebase from three angles simultaneously: storage resilience, React runtime behaviour, and user-facing UX flows. The existing audit leaned heavily on the ARCHITECTURE.md's stated edge cases rather than independently verifying every code path.

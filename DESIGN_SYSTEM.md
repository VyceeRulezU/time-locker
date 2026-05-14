# Design System

> The visual language of Time-Locked Letters — tokens, typography, motion, and aesthetic intent.

---

## Concept

The visual identity is built around one metaphor: **a writing desk drawer in a house that has been still for a long time**.

Everything should feel warm, patient, and slightly aged. Not broken — preserved. The app earns trust through restraint: generous whitespace, unhurried typography, colour that whispers rather than shouts. The only moment of drama is the reveal animation, which should feel genuinely ceremonial — like breaking a wax seal.

---

## Color Tokens

All tokens are defined as CSS custom properties on `:root` in `src/styles/globals.css`.

### Base Palette

```css
:root {
  /* Backgrounds */
  --color-bg-base:        #F5F0E8;   /* aged parchment — main page background */
  --color-bg-surface:     #EDE6D6;   /* letter card background */
  --color-bg-overlay:     #2A2318CC; /* modal/form backdrop — dark with 80% opacity */
  --color-bg-form:        #FAF7F2;   /* compose form panel */

  /* Ink — text */
  --color-ink-primary:    #1C1812;   /* headlines, body copy */
  --color-ink-secondary:  #5C5240;   /* supporting text, metadata */
  --color-ink-muted:      #9C8E78;   /* placeholders, disabled, countdown labels */
  --color-ink-inverse:    #F5F0E8;   /* text on dark backgrounds */

  /* Accent — gold */
  --color-gold-bright:    #C8973A;   /* unlock CTA, revealed letter accent */
  --color-gold-muted:     #A87C30;   /* hover state for gold elements */
  --color-gold-subtle:    #F0DFB0;   /* background tint on revealed cards */

  /* Seal — the locked state */
  --color-seal-primary:   #7A2E2E;   /* wax seal, lock icon */
  --color-seal-cracked:   #A05040;   /* wax seal when unlocked-but-unopened */

  /* Utility */
  --color-border:         #D4C9B0;   /* card borders, dividers */
  --color-border-focus:   #C8973A;   /* focus rings — same as gold accent */
  --color-danger:         #8B3A3A;   /* delete button, destructive actions */
  --color-danger-hover:   #6B2A2A;
  --color-success:        #4A6741;   /* confirmation states (future use) */
}
```

### Dark Mode (Future)

A `[data-theme="dark"]` block is scaffolded but not active in v1:

```css
[data-theme="dark"] {
  --color-bg-base:        #1A1610;
  --color-bg-surface:     #22201A;
  --color-ink-primary:    #EDE6D6;
  --color-ink-secondary:  #B0A48C;
  /* ... */
}
```

---

## Typography

### Font Stack

```css
:root {
  /* Display — headings, recipient names, app title */
  --font-display: 'Lora', 'Georgia', serif;

  /* Body — letter content, form fields, UI copy */
  --font-body: 'Crimson Pro', 'Palatino Linotype', serif;

  /* Mono — countdown digits only */
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* UI — buttons, labels, navigation (small, functional text) */
  --font-ui: 'DM Sans', 'Helvetica Neue', sans-serif;
}
```

**Loading strategy:** Lora and Crimson Pro from Google Fonts. DM Sans from Google Fonts. JetBrains Mono from Google Fonts. All loaded in `src/styles/fonts.css` with `font-display: swap`.

### Type Scale

```css
:root {
  --text-xs:   0.75rem;    /* 12px — metadata, timestamps */
  --text-sm:   0.875rem;   /* 14px — UI labels, helper text */
  --text-base: 1rem;       /* 16px — body copy baseline */
  --text-md:   1.125rem;   /* 18px — letter content */
  --text-lg:   1.375rem;   /* 22px — recipient names on cards */
  --text-xl:   1.75rem;    /* 28px — section headings */
  --text-2xl:  2.25rem;    /* 36px — app title */
  --text-3xl:  3rem;       /* 48px — hero display (empty state) */
}
```

### Line Height & Tracking

```css
:root {
  --leading-tight:   1.2;   /* headings */
  --leading-snug:    1.4;   /* recipient names, compact UI */
  --leading-normal:  1.6;   /* body copy */
  --leading-relaxed: 1.8;   /* letter content — the most important reading */

  --tracking-tight:  -0.02em;   /* display headings */
  --tracking-normal:  0em;
  --tracking-wide:    0.06em;   /* UI labels, uppercase metadata */
  --tracking-widest:  0.12em;   /* countdown labels — DD HH MM SS */
}
```

---

## Spacing Scale

Based on a 4px grid.

```css
:root {
  --space-1:   0.25rem;   /* 4px */
  --space-2:   0.5rem;    /* 8px */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
}
```

---

## Border Radius

```css
:root {
  --radius-sm:   2px;    /* subtle — input fields */
  --radius-md:   6px;    /* cards */
  --radius-lg:   12px;   /* form panel, modals */
  --radius-full: 9999px; /* pills, circular icons */
}
```

---

## Shadows & Elevation

```css
:root {
  /* Resting state — cards */
  --shadow-card: 0 1px 3px rgba(28, 24, 18, 0.08),
                 0 4px 12px rgba(28, 24, 18, 0.04);

  /* Hover state — cards */
  --shadow-card-hover: 0 2px 8px rgba(28, 24, 18, 0.12),
                       0 8px 24px rgba(28, 24, 18, 0.08);

  /* Modals and panels */
  --shadow-overlay: 0 24px 48px rgba(28, 24, 18, 0.28),
                    0 8px 16px rgba(28, 24, 18, 0.16);

  /* Wax seal / icon inset */
  --shadow-inset: inset 0 2px 4px rgba(28, 24, 18, 0.12);
}
```

---

## Motion

### Timing Curves

```css
:root {
  --ease-standard:    cubic-bezier(0.4, 0, 0.2, 1);   /* most UI transitions */
  --ease-decelerate:  cubic-bezier(0, 0, 0.2, 1);     /* elements entering */
  --ease-accelerate:  cubic-bezier(0.4, 0, 1, 1);     /* elements leaving */
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1); /* playful bounces */
  --ease-ceremony:    cubic-bezier(0.16, 1, 0.3, 1);  /* reveal animation — slow start, dramatic finish */
}
```

### Duration Scale

```css
:root {
  --duration-instant:   80ms;    /* icon state changes */
  --duration-fast:      150ms;   /* hover fills, colour changes */
  --duration-normal:    250ms;   /* most UI transitions */
  --duration-slow:      400ms;   /* panel/modal enter */
  --duration-ceremony:  700ms;   /* letter reveal stages */
  --duration-long:      1000ms;  /* full reveal sequence */
}
```

### Keyframe Library (`src/styles/animations.css`)

#### `fadeUp` — card entry, content reveal

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### `fadeIn` — generic opacity entrance

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

#### `slideUp` — form panel entrance

```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### `sealCrack` — wax seal moment (stage 1 of reveal)

```css
@keyframes sealCrack {
  0%   { opacity: 1; filter: brightness(1); }
  30%  { opacity: 0.6; filter: brightness(1.4); }
  60%  { opacity: 0.3; filter: brightness(0.8); }
  100% { opacity: 0; filter: brightness(1); }
}
```

#### `paperUnfold` — card expansion (stage 2 of reveal)

```css
@keyframes paperUnfold {
  from {
    transform: scaleY(0.92);
    transform-origin: top center;
  }
  to {
    transform: scaleY(1);
    transform-origin: top center;
  }
}
```

#### `digitFlip` — countdown second tick

```css
@keyframes digitFlip {
  0%   { transform: translateY(0); opacity: 1; }
  40%  { transform: translateY(-4px); opacity: 0.4; }
  60%  { transform: translateY(4px); opacity: 0.4; }
  100% { transform: translateY(0); opacity: 1; }
}
```

#### `cardExit` — delete animation

```css
@keyframes cardExit {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Reduced Motion

All animations must respect the user's OS-level preference:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The reveal sequence falls back to a simple `fadeIn` only.

---

## Texture & Surface Treatment

### Paper grain overlay

Applied as a pseudo-element on the page background:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* fine noise SVG */
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}
```

### Card border treatment

Cards use a subtle double-border effect to suggest aged paper edges:

```css
.card {
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card), inset 0 0 0 1px rgba(255,255,255,0.5);
}
```

### Wax seal icon

SVG rendered inline within `LetterCard`. Uses `--color-seal-primary` for the locked state and `--color-seal-cracked` for the unlocked-unopened state. A CSS filter `drop-shadow` gives it dimensionality.

---

## Layout

### Grid

```css
.letterGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  padding: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}
```

### Card anatomy

```
┌─────────────────────────────┐
│  Wax seal icon   [status]   │  ← header row
│                             │
│  To: [Recipient Name]       │  ← recipient (--font-display, --text-lg)
│                             │
│  ┌─ LOCKED ─────────────┐   │
│  │  DD  HH  MM  SS      │   │  ← Countdown component
│  └──────────────────────┘   │
│                             │
│  Written [createdAt date]   │  ← metadata (--font-ui, --text-xs)
└─────────────────────────────┘
```

### Form panel

Slides up from the bottom, covering ~60% of the viewport on desktop, 100% on mobile. Has a drag handle indicator. Content is vertically scrollable if letter content is very long.

---

## Component-Specific Styles

### Locked card

- Background: `--color-bg-surface`
- Wax seal: `--color-seal-primary` with `drop-shadow(0 2px 4px rgba(122,46,46,0.3))`
- Countdown digits: `--font-mono`, `--text-xl`, `--color-ink-primary`
- Countdown labels: `--font-ui`, `--text-xs`, `--color-ink-muted`, `letter-spacing: var(--tracking-widest)`, uppercase

### Unlocked / Unopened card

- Background: `--color-bg-surface` with a subtle `--color-gold-subtle` tint
- Wax seal: `--color-seal-cracked`
- "Open Letter" button: outlined, `--color-gold-bright` border and text, fills on hover

### Revealed card

- Background: `--color-gold-subtle` at 40% opacity over `--color-bg-surface`
- Letter content: `--font-body`, `--text-md`, `--leading-relaxed`, `--color-ink-primary`
- Left border accent: `3px solid --color-gold-bright`
- Metadata: `--font-ui`, `--text-xs`, `--color-ink-muted`

### Delete button

- Icon button, no label
- Default: `--color-ink-muted`
- Hover: `--color-danger`
- Transition: `color var(--duration-fast) var(--ease-standard)`

---

## Icon Guidelines

All icons are inline SVGs. No icon library dependency.

| Icon | Used In | Description |
|---|---|---|
| Wax seal (closed) | Locked card header | Circle with embossed pattern |
| Wax seal (cracked) | Unlocked card header | Same with crack lines |
| Envelope | Empty state | Simple open envelope |
| Lock | Locked card status badge | Padlock, minimal |
| Hourglass | Countdown section | Stylised, not literal |
| Trash | Delete button | Simple bin outline |
| X / Close | Form close, modal dismiss | 16px, thin stroke |

All SVGs use `currentColor` so they inherit text color automatically.

---

## Responsive Breakpoints

```css
/* Mobile first */

/* Small (default): 0–639px */
.letterGrid {
  grid-template-columns: 1fr;
  padding: var(--space-4);
  gap: var(--space-4);
}

/* Medium: 640px+ */
@media (min-width: 640px) {
  .letterGrid {
    grid-template-columns: repeat(2, 1fr);
    padding: var(--space-6);
  }
}

/* Large: 1024px+ */
@media (min-width: 1024px) {
  .letterGrid {
    grid-template-columns: repeat(3, 1fr);
    padding: var(--space-8);
  }
}

/* XL: 1280px+ */
@media (min-width: 1280px) {
  .letterGrid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

The form panel is full-screen on mobile (`width: 100vw`) and constrained to `480px` centered on desktop.

---

## Design Principles Summary

| Principle | Application |
|---|---|
| **Patience** | Generous whitespace, unhurried type, no rushing the user |
| **Warmth** | Parchment tones, serif fonts, ink metaphors throughout |
| **Ceremony** | The reveal is the most important moment — give it weight |
| **Restraint** | Gold is used sparingly so it means something when it appears |
| **Legibility** | Letter content uses the most comfortable reading settings in the app |

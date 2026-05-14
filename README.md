# Time-Locked Letters

> Notes that refuse to open until the future arrives.

---

## What Is This?

Time-Locked Letters is a single-page React application where users write letters that cannot be read until a chosen date. There is no backend. Every letter lives in `localStorage`, survives page refreshes, and unlocks exactly when its time comes.

Some letters are for future selves. Some are birthday surprises. Some are confessions meant to rest for ninety days. This app is the place where they sleep.

---

## Features

- ✍️ **Compose a letter** — write a message, name a recipient, set an unlock date
- 🔒 **Locked letters** — show recipient name and a live countdown (days, hours, minutes, seconds)
- 📬 **Unlocked letters** — reveal full content with a ceremonial animation when their time arrives
- 🗑️ **Delete letters** — remove any letter with a confirmation step
- 💾 **Persistent storage** — all letters survive page refresh via `localStorage`
- 📭 **Empty state** — a thoughtful prompt when no letters exist yet

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | CSS Modules + global CSS variables |
| Date math | `date-fns` |
| ID generation | `nanoid` |
| Persistence | Native `localStorage` |
| State | React hooks (`useState`, `useEffect`, `useCallback`) |

No backend. No auth. No external state library.

---

## Project Structure

```
time-locked-letters/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── LetterCard/
│   │   ├── LetterForm/
│   │   ├── Countdown/
│   │   ├── RevealOverlay/
│   │   ├── EmptyState/
│   │   └── DeleteConfirm/
│   ├── hooks/
│   │   ├── useLetters.ts
│   │   ├── useCountdown.ts
│   │   └── useNow.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   ├── dateUtils.ts
│   │   └── idUtils.ts
│   ├── types/
│   │   └── letter.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── animations.css
│   │   └── fonts.css
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   ├── 01-explanation.md       ← beginner-friendly walkthrough
│   ├── 02-principles.md        ← engineering principles
│   ├── 03-audit.md             ← technical audit
│   ├── 04-cross-check.md       ← cross-check analysis
│   ├── 05-tinker.md            ← live behaviour verification
│   └── 06-lie-detector.md      ← statement verification
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js `>=18.0.0`
- npm `>=9.0.0` or pnpm `>=8.0.0`

### Install

```bash
git clone https://github.com/your-username/time-locked-letters.git
cd time-locked-letters
npm install
```

### Run Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally:

```bash
npm run preview
```

### Type Check

```bash
npm run typecheck
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Serve the `dist/` output locally |
| `npm run typecheck` | Run `tsc --noEmit` without building |
| `npm run lint` | ESLint across `src/` |

---

## localStorage Schema

All letters are stored under a single key:

```
Key:   "time_locked_letters"
Value: JSON.stringify(Letter[])
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full `Letter` interface and storage contract.

---

## Deployment

The app is a static site — drop the `dist/` folder anywhere:

- **Vercel**: connect the repo, zero config needed
- **Netlify**: drag and drop `dist/` or connect via Git
- **GitHub Pages**: the `vite.config.ts` sets `base: '/time-locker/'` for subpath deployment

No environment variables required.

### Live Site

- **Deployed:** [vyceerulezu.github.io/time-locker](https://vyceerulezu.github.io/time-locker/)
- **Repository:** [github.com/VyceeRulezU/time-locker](https://github.com/VyceeRulezU/time-locker)

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

Requires `localStorage`, CSS custom properties, and CSS animation support.

---

## Roadmap (Future Scope)

- [ ] Optional passphrase lock per letter
- [ ] Export letter as PDF on reveal
- [ ] Notification via browser push API when a letter unlocks
- [ ] Light / dark theme toggle
- [ ] Letter categories / tags
- [ ] Confetti burst on first unlock

---

## License

MIT — do whatever you want with it. Just don't open letters before their time.

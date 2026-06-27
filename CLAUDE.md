# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build to build/
```

No test runner is configured.

## Architecture

Single-page React + TypeScript app built with Vite. All game logic lives in `src/App.tsx`; there is no router.

**Entry point flow:**
1. `src/main.tsx` mounts `<App />`
2. `App` reads `localStorage` for an existing session via `src/utils/storage.ts`
3. If no session → renders `src/components/auth/AuthScreen.tsx` (login / register / guest)
4. Once authenticated → renders the 3-box treasure game

**State management:** plain React `useState` / `useEffect` — no external store.

**Persistence:** all data is stored in `localStorage` via `src/utils/storage.ts`
- `treasure_users` — array of `User` (username + SHA-256 password hash)
- `treasure_session` — current `Session` (username + isGuest flag)
- `treasure_scores_<username>` — array of `GameRecord` (score + timestamp)

**Key types** (`src/types/auth.ts`): `User`, `Session`, `GameRecord`

**UI components:** `src/components/ui/` contains shadcn/ui primitives (Radix-based). Import alias `@` maps to `src/`.

**Assets:**
- Images: `src/assets/` — `treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png` (used as custom cursor on closed chests)
- Audio: `src/audios/` — `chest_open.mp3` (treasure), `chest_open_with_evil_laugh.mp3` (skeleton)

**Scoring logic (in `App.tsx`):**
- 3 boxes, one randomly contains treasure
- Opening treasure: +$100; opening skeleton: −$50
- Game ends when treasure is found or all boxes are opened
- Scores are only saved for non-guest sessions

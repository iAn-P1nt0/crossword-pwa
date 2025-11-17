# Crossword PWA Implementation Roadmap

> Reference: `AGENTS.md`

This roadmap converts the remaining TODO list into actionable phases with dependencies, required libraries, and testing hooks. Each phase can be turned into granular issues or PRs.

## Phase 1: Parsing + Download Pipeline

1. **Parser Factory (`src/parsers/index.ts`)**
   - Detect format by extension/magic bytes.
   - Dispatch to specific parser modules.
   - Register factory with `registerPuzzleParser` from `services/api/puzzleApiService`.
   - Provide graceful fallbacks + structured errors.
2. **Format Parsers**
   - `puzParser.ts`: wrap @xwordly/xword-parser; port missing features from `puzpy` if needed.
   - `ipuzParser.ts`: strict schema validation + normalization.
   - `jpzParser.ts`: use `fast-xml-parser` for XML, map circles/rebus markers.
   - `xdParser.ts`: line-by-line text parser; ensure robust trimming.
3. **Download Services**
   - `services/api/rssService.ts`: fetch + parse RSS feeds for sources like BestCrosswords using DOMParser.
   - `nytService.ts`, `wsjService.ts`: handle auth headers per source definition; reuse `PuzzleDownloadRequest`.
   - Add shared retry/backoff helper in `services/api/httpClient.ts` (optional) to centralize fetch logic.
4. **Source Registry**
   - Create `src/services/api/sourceRegistry.ts` exporting prioritized arrays for free/paid sources listed in `AGENTS.md`.
   - Include metadata (frequency, auth type, download templates) to seed the UI + download manager.

**Testing hooks**: Node-based parser unit tests (Vitest) using fixture files; integration test for `downloadAndParsePuzzle` with mocked fetch.

## Phase 2: Storage + Sync Services

1. **Download Queue (`services/sync/downloadManager.ts`)**
   - Dexie-backed queue (already typed) with enqueue/dequeue helpers.
   - Concurrency limit (e.g., 2 simultaneous downloads).
   - Emits events via `BroadcastChannel` for UI updates.
2. **Background Sync (`services/sync/syncService.ts`)**
   - Schedule periodic sync per source frequency.
   - Register service worker sync tags where supported; fallback to in-app timers.
   - Automatic retry with exponential backoff and offline detection.
3. **Worker (`services/worker/serviceWorker.ts`)**
   - Workbox runtime caching strategies from `AGENTS.md` (app shell cache-first, puzzles network-first, etc.).
   - Offline analytics events (optional) for solving streaks.
4. **Settings/Puzzle Storage Enhancements**
   - Add migrations for Dexie version >1 when new indexes needed.
   - Implement `puzzleStorage.getCachedBySource(sourceId)` helper for offline fetch fallback.

**Testing hooks**: Dexie integration tests using `fake-indexeddb`; Workbox smoke test using `workbox-build generateSW --dry-run`.

## Phase 3: State Management + Hooks

1. **Zustand Stores (`src/stores`)**
   - `usePuzzleStore`: loaded puzzle, selection state, validators, persistence to Dexie.
   - `useSourcesStore`: toggle sources, store credentials, call `sourceRegistry` + `settingsStorage`.
   - `useSettingsStore`: theme, grid options, offline toggles.
   - `useStatsStore`: track streaks, solve times, integrate with progress snapshots.
2. **Custom Hooks (`src/hooks`)**
   - `useKeyboard`: cross-platform keyboard handling per grid best practices.
   - `usePuzzleState`: binds store, storage, validators, and grid calculations.
   - `useOfflineSync`: monitors navigator.onLine, triggers sync service.
   - `useStats`: aggregates stats for dashboards.
3. **Utilities (`src/utils`)**
   - `gridCalculations.ts`: numbering, cursor movement, highlight sets.
   - `validation.ts`: compare entries vs. solution, optional fuzziness.
   - `formatConverter.ts`: convert between puzzle formats when exporting.
   - `dateUtils.ts`: timezone-aware formatting for source schedules.

**Testing hooks**: Store tests with Zustand's `act`; hook tests via React Testing Library + Vitest.

## Phase 4: UI Components

1. **Layout (`src/components/layout`)**
   - `AppLayout.tsx`: responsive shell with header, side panels, and offline indicator.
   - `Header.tsx`: navigation + theme toggle + sync button.
   - `PuzzleViewer.tsx`: orchestrates grid, clues, keyboard.
2. **Grid Module (`src/components/grid`)**
   - `CrosswordGrid.tsx`: custom SVG or ReactCrossword integration for base rendering.
   - `CrosswordCell.tsx`: handles animations, focus rings, conflict states.
   - `GridControls.tsx`: direction toggles, check/reveal/pencil mode buttons.
3. **Clues Module (`src/components/clues`)**
   - `ClueList.tsx`, `ClueItem.tsx`, `ClueNavigation.tsx` with virtualization (e.g., `react-aria` list or custom) for performance.
4. **Keyboard Module**
   - `VirtualKeyboard.tsx`: mobile-friendly input with hints.
5. **Sources + Settings**
   - `SourceManager.tsx`, `SourceCard.tsx`, `SourceConfig.tsx`: CRUD for free/paid sources.
   - `Settings.tsx`, `ThemeToggle.tsx`, `SubscriptionManager.tsx` hooking into stores.
6. **UI Library (`src/components/ui`)**
   - Generate shadcn primitives (Button, Card, Dialog, Tabs, Tooltip, Sheet) as needed with `npx shadcn@latest add ...`.

**Testing hooks**: visual regression via Storybook or Chromatic; interaction tests with Playwright (focus management, keyboard navigation, screen reader labels).

## Phase 5: PWA + Documentation

1. **PWA Manifest + Icons (`public/`)**
   - Tailor `manifest.json` (name, theme colors, start URL) and provide multiple icon sizes + maskable PNG.
   - Configure `vite.config.ts` to copy Workbox service worker + inject manifest.
2. **Offline/Install UX**
   - Add install prompt component, offline notifications, and storage quota warnings.
3. **README + Docs**
   - Update `README.md` with setup steps, architecture diagram, and contribution guidelines.
   - Keep `docs/implementation-roadmap.md` updated as phases complete; optionally add ADRs for major decisions.

**Testing hooks**: Lighthouse PWA audit, manual install test on Android/iOS, `npm run preview` behind HTTPS tunnel.

## Dependencies Overview

| Phase | Depends On | Outputs |
| --- | --- | --- |
| 1 | Existing types, parser stubs | Unified parser pipeline feeding storage |
| 2 | Phase 1 data models | Reliable offline cache + sync queue |
| 3 | Phases 1-2 data availability | User-facing state and navigation logic |
| 4 | Phases 1-3 | Complete UI experiences |
| 5 | All prior phases | Production-ready PWA + docs |

## Suggested Milestones

1. **M1 – Parser MVP**: Download WSJ + BestCrosswords, parse PUZ/iPUZ, store offline.
2. **M2 – Offline Backbone**: Sync queue, Workbox caching, Dexie persistence fully wired.
3. **M3 – Interactive Grid UI**: SVG grid + clue navigation + keyboard/hints.
4. **M4 – Source & Subscription UX**: Manage paid/free sources, auth flows, settings.
5. **M5 – Ship Ready**: Manifest, service worker polish, README + deployment pipeline.

Use this roadmap as the canonical tracker for TODO #4 and update checkpoints as features land.

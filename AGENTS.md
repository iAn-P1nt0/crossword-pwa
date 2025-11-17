# AGENTS.md - AI Coding Assistant Instructions

## Project Overview
This is a **Crossword Puzzle Progressive Web App** that aggregates and displays crossword puzzles from multiple free and paid sources. The app is inspired by the Android Shortyz app and provides offline-first functionality with a modern, responsive interface.

## Core Technology Stack
- **Framework**: React 18+ with TypeScript 5+
- **Build Tool**: Vite
- **State Management**: Zustand (lightweight alternative to Redux)
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **PWA**: Workbox for service workers and caching
- **Database**: IndexedDB (via Dexie.js) for offline storage
- **Grid Rendering**: SVG-based custom components (inspired by @jaredreisinger/react-crossword)
- **Parser**: @xwordly/xword-parser for multi-format support

## Project Structure
```
crossword-pwa/
├── src/
│   ├── components/
│   │   ├── grid/
│   │   │   ├── CrosswordGrid.tsx       # Main SVG grid component
│   │   │   ├── CrosswordCell.tsx       # Individual cell component
│   │   │   └── GridControls.tsx        # Grid interaction controls
│   │   ├── clues/
│   │   │   ├── ClueList.tsx            # Clue display component
│   │   │   ├── ClueItem.tsx            # Individual clue
│   │   │   └── ClueNavigation.tsx      # Navigation between clues
│   │   ├── keyboard/
│   │   │   └── VirtualKeyboard.tsx     # Mobile on-screen keyboard
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx           # Main app layout
│   │   │   ├── Header.tsx              # App header with navigation
│   │   │   └── PuzzleViewer.tsx        # Puzzle display container
│   │   ├── sources/
│   │   │   ├── SourceManager.tsx       # Manage puzzle sources
│   │   │   ├── SourceCard.tsx          # Display individual source
│   │   │   └── SourceConfig.tsx        # Configure source settings
│   │   ├── settings/
│   │   │   ├── Settings.tsx            # App settings
│   │   │   ├── ThemeToggle.tsx         # Dark/light mode switch
│   │   │   └── SubscriptionManager.tsx # Paid source management
│   │   └── ui/                         # shadcn/ui components
│   ├── parsers/
│   │   ├── index.ts                    # Parser factory
│   │   ├── puzParser.ts                # Across Lite .puz format
│   │   ├── ipuzParser.ts               # iPUZ JSON format
│   │   ├── jpzParser.ts                # JPZ XML format
│   │   └── xdParser.ts                 # XD text format
│   ├── services/
│   │   ├── api/
│   │   │   ├── puzzleApiService.ts     # Fetch puzzles from APIs
│   │   │   ├── nytService.ts           # NYT-specific API
│   │   │   ├── wsjService.ts           # WSJ-specific API
│   │   │   └── rssService.ts           # RSS feed aggregator
│   │   ├── storage/
│   │   │   ├── db.ts                   # Dexie database schema
│   │   │   ├── puzzleStorage.ts        # Puzzle CRUD operations
│   │   │   └── settingsStorage.ts      # Settings persistence
│   │   ├── sync/
│   │   │   ├── syncService.ts          # Background sync logic
│   │   │   └── downloadManager.ts      # Puzzle download queue
│   │   └── worker/
│   │       └── serviceWorker.ts        # PWA service worker
│   ├── stores/
│   │   ├── usePuzzleStore.ts           # Current puzzle state
│   │   ├── useSourcesStore.ts          # Configured sources
│   │   ├── useSettingsStore.ts         # App settings
│   │   └── useStatsStore.ts            # User statistics
│   ├── types/
│   │   ├── puzzle.types.ts             # Puzzle data structures
│   │   ├── grid.types.ts               # Grid cell structures
│   │   ├── source.types.ts             # Source configuration
│   │   └── api.types.ts                # API response types
│   ├── utils/
│   │   ├── validation.ts               # Answer validation
│   │   ├── formatConverter.ts          # Format conversions
│   │   ├── dateUtils.ts                # Date formatting
│   │   └── gridCalculations.ts         # Grid layout calculations
│   ├── hooks/
│   │   ├── useKeyboard.ts              # Keyboard navigation
│   │   ├── usePuzzleState.ts           # Puzzle state management
│   │   ├── useOfflineSync.ts           # Offline sync handling
│   │   └── useStats.ts                 # Statistics tracking
│   ├── App.tsx                         # Root component
│   └── main.tsx                        # Entry point
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── icons/                          # App icons
│   └── sw.js                           # Service worker
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Key Puzzle Formats & Parsing

### Supported Formats
1. **PUZ (Across Lite)** - Binary format, de facto standard
   - Use @xwordly/xword-parser or custom binary parser
   - Structure: Header (52 bytes) + Grid + Clues + Metadata
   
2. **iPUZ** - Open JSON format (RECOMMENDED)
   - Native JSON structure, easiest to parse
   - Spec: https://ipuz.org
   
3. **JPZ (Crossword Compiler)** - XML-based
   - Parse with XML parser (fast-xml-parser)
   
4. **XD** - Plain text format by Saul Pwanson
   - Simple text parsing

### Parser Implementation Pattern
```typescript
interface PuzzleData {
  title: string;
  author: string;
  publisher: string;
  publishedDate: Date;
  rows: number;
  cols: number;
  grid: string[][];              // 2D array of letters
  cellBlocks: boolean[][];       // Black cells
  cluesAcross: Record<number, string>;
  cluesDown: Record<number, string>;
  notes?: string;
}

interface ParseResult {
  success: boolean;
  data?: PuzzleData;
  error?: string;
}

async function parsePuzzle(file: File): Promise<ParseResult> {
  // Detect format from extension or magic bytes
  // Route to appropriate parser
  // Return unified PuzzleData structure
}
```

## Data Sources Configuration

### Free Sources
```typescript
const FREE_SOURCES = [
  {
    id: 'wsj-daily',
    name: 'Wall Street Journal',
    url: 'https://s.wsj.net/public/resources/documents/[XWD]{MMDDYYYY}.pdf',
    format: 'puz',
    frequency: 'daily',
    schedule: 'Mon-Sat @ midnight ET'
  },
  {
    id: 'best-crosswords',
    name: 'Best Crosswords',
    url: 'http://bestcrosswords.com/syndication/feed',
    format: 'rss',
    frequency: 'daily'
  }
];
```

### Paid Sources (User Configuration)
```typescript
interface PaidSource {
  id: string;
  name: string;
  apiEndpoint: string;
  authType: 'api_key' | 'oauth' | 'cookie';
  credentials: {
    apiKey?: string;
    username?: string;
    password?: string;
  };
  format: 'json' | 'puz' | 'ipuz';
}
```

## PWA Requirements

### Service Worker Caching Strategy
- **App Shell**: Cache-first (HTML, CSS, JS)
- **Puzzle Files**: Network-first with fallback
- **Images/Icons**: Cache-first
- **API Responses**: Stale-while-revalidate

### Offline Capabilities
1. Cache last 30 downloaded puzzles
2. Store in-progress puzzle state
3. Queue failed API requests for retry
4. Sync when connection restored

### IndexedDB Schema
```typescript
const db = new Dexie('CrosswordDB');
db.version(1).stores({
  puzzles: '++id, sourceId, date, title, downloaded',
  progress: 'puzzleId, grid, timestamp',
  sources: '++id, name, enabled',
  settings: 'key'
});
```

## Grid Rendering Best Practices

### SVG Grid Structure
```tsx
<svg viewBox="0 0 {cols * cellSize} {rows * cellSize}">
  {grid.map((row, r) => 
    row.map((cell, c) => (
      <g key={`${r}-${c}`}>
        <rect 
          x={c * cellSize} 
          y={r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={cell.isBlack ? 'black' : 'white'}
        />
        {cell.number && (
          <text x={...} y={...} fontSize="8">{cell.number}</text>
        )}
        {cell.value && (
          <text x={...} y={...} fontSize="24">{cell.value}</text>
        )}
      </g>
    ))
  )}
</svg>
```

### Touch & Keyboard Navigation
- Arrow keys: Move between cells
- Tab/Shift+Tab: Switch direction (across/down)
- Space: Toggle direction
- Backspace: Clear cell and move back
- Touch: Tap to focus, double-tap to switch direction

## State Management with Zustand

```typescript
interface PuzzleStore {
  currentPuzzle: PuzzleData | null;
  grid: string[][];
  focusedCell: { row: number; col: number } | null;
  direction: 'across' | 'down';
  
  loadPuzzle: (puzzle: PuzzleData) => void;
  updateCell: (row: number, col: number, value: string) => void;
  setFocus: (row: number, col: number) => void;
  toggleDirection: () => void;
  validatePuzzle: () => boolean;
  resetPuzzle: () => void;
}
```

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use async/await over promises
- Implement proper error boundaries
- Follow React best practices (memo, useCallback, useMemo)

### Performance Optimization
- Virtualize long clue lists
- Memoize grid calculations
- Debounce API calls
- Use Web Workers for heavy parsing
- Lazy load puzzle archives

### Testing Strategy
- Unit tests: Parsers, utilities, validation
- Integration tests: State management, API services
- E2E tests: Critical user flows (load puzzle, solve, check)
- PWA tests: Offline functionality, caching

### Accessibility
- ARIA labels for grid cells
- Keyboard navigation support
- Screen reader announcements for clue changes
- High contrast mode support
- Adjustable font sizes

## API Integration Patterns

### Fetching Puzzles
```typescript
async function fetchDailyPuzzle(source: PuzzleSource): Promise<PuzzleData> {
  try {
    const response = await fetch(source.url, {
      headers: source.authHeaders
    });
    
    if (!response.ok) throw new Error('Fetch failed');
    
    const blob = await response.blob();
    const parsed = await parsePuzzle(blob);
    
    // Cache in IndexedDB
    await db.puzzles.add({
      sourceId: source.id,
      date: new Date(),
      data: parsed.data,
      downloaded: true
    });
    
    return parsed.data;
  } catch (error) {
    // Return cached version if available
    return getCachedPuzzle(source.id);
  }
}
```

## Deployment
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy: Vercel, Netlify, or GitHub Pages
- Ensure HTTPS for PWA requirements
- Configure headers for caching
- Set up environment variables for API keys

## Common Pitfalls to Avoid
1. Don't parse puzzles on main thread (use Web Workers)
2. Don't store large puzzle archives in memory
3. Don't forget to handle CORS for external APIs
4. Don't skip service worker error handling
5. Don't hard-code API keys (use .env)
6. Don't ignore mobile viewport optimization

## When to Ask for Clarification
- Source authentication details
- Specific UI/UX preferences
- Custom puzzle format requirements
- Performance requirements (grid size limits)
- Target devices and browsers

## Useful Commands
```bash
npm create vite@latest crossword-pwa -- --template react-ts
npm install zustand dexie @xwordly/xword-parser
npm install -D tailwindcss @types/dexie workbox-cli
npm install @radix-ui/react-* # shadcn dependencies
```

## Reference Links
- Shortyz source: https://github.com/kebernet/shortyz
- iPUZ spec: https://ipuz.org
- PWA checklist: https://web.dev/pwa-checklist/
- React Crossword: https://github.com/JaredReisinger/react-crossword
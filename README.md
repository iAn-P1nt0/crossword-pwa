# Crossword PWA

A Progressive Web App for aggregating and solving crossword puzzles from multiple free and paid sources, inspired by the Android Shortyz app.

## Features

- **Offline-First**: Solve puzzles without an internet connection using IndexedDB storage
- **Multi-Source Support**: Aggregates puzzles from WSJ, USA Today, LA Times, Universal, and more
- **Interactive Grid**: SVG-based crossword grid with keyboard and touch navigation
- **Progress Tracking**: Auto-saves your progress, tracks solve times and streaks
- **Dark Mode**: System-aware theme with manual toggle
- **Mobile-Friendly**: Responsive design with virtual keyboard for mobile devices

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite (Rolldown)
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS + shadcn/ui
- **PWA**: Custom Service Worker with cache strategies
- **Database**: IndexedDB via Dexie.js
- **Parsers**: @xwordly/xword-parser for PUZ/iPUZ formats

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173/` to see the app.

#### Remote Puzzle Downloads (Optional)

By default, remote puzzle downloads are **disabled** during local development to avoid CORS errors and auth failures. To enable real puzzle downloads:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Uncomment the `VITE_ENABLE_REMOTE_SOURCES` line in `.env`:
   ```bash
   VITE_ENABLE_REMOTE_SOURCES=true
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

**Note**: Some puzzle sources require authentication or have CORS restrictions. You may see 401/403/404 errors for sources that require credentials.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # React UI components (grid, clues, layout, keyboard, sources)
├── hooks/          # Custom React hooks (keyboard, offline sync, puzzle state, stats)
├── parsers/        # Puzzle format parsers (PUZ, iPUZ, JPZ, XD)
├── services/       # Business logic (API, storage, sync, worker)
├── stores/         # Zustand state stores (puzzle, sources, settings, stats)
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (grid calculations, etc.)
└── config/         # Runtime configuration
```

## Available Puzzle Sources

### Free Sources (Enabled by Default)
- Wall Street Journal (Daily)
- USA Today (Daily)
- Los Angeles Times (Daily)
- Universal Crossword (Daily)
- Newsday - Stan Newman (Daily)
- Joseph Crosswords (Weekly)
- Jonesin' Crosswords (Weekly)
- Erik Agard (Weekly)
- Chronicle of Higher Education (Weekly)
- CrosSynergy/Washington Post (Daily)

### Paid Sources (Require Credentials)
- New York Times Premium
- WSJ Premium
- The Guardian (API key required)

## PWA Features

- **Offline Support**: Service worker caches app shell and puzzle files
- **Background Sync**: Automatic puzzle downloads when online
- **Installable**: Add to home screen on mobile devices
- **Responsive**: Works on desktop, tablet, and mobile

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- Inspired by [Shortyz Crossword App](https://github.com/kebernet/shortyz)
- Puzzle parsing powered by [@xwordly/xword-parser](https://github.com/xwordly/xword-parser)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

## Development Notes

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

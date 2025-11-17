import useSettingsStore from '@/stores/useSettingsStore'
import usePuzzleStore from '@/stores/usePuzzleStore'

interface HeaderProps {
  onSyncRequest: () => void
  syncing?: boolean
}

function Header({ onSyncRequest, syncing }: HeaderProps) {
  const theme = useSettingsStore((state) => state.theme)
  const isOnline = useSettingsStore((state) => state.isOnline)
  const setTheme = useSettingsStore((state) => state.setTheme)
  const currentPuzzle = usePuzzleStore((state) => state.currentPuzzle)

  const handleTheme = () => {
    const options: Array<typeof theme> = ['system', 'light', 'dark']
    const index = options.indexOf(theme)
    const next = options[(index + 1) % options.length]
    void setTheme(next)
    if (typeof document !== 'undefined') {
      const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      const shouldUseDark = next === 'dark' || (next === 'system' && prefersDark)
      document.documentElement.classList.toggle('dark', shouldUseDark)
    }
  }

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Crossword PWA</p>
        <h1 className="text-2xl font-semibold">
          {currentPuzzle ? currentPuzzle.metadata.title : 'Load a puzzle to begin'}
        </h1>
        {currentPuzzle && (
          <p className="text-sm text-muted-foreground">
            {currentPuzzle.metadata.author} · {new Date(currentPuzzle.metadata.publishedDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100'}`}
        >
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </span>
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium"
          onClick={handleTheme}
        >
          Theme: {theme}
        </button>
        <button
          type="button"
          className="rounded-full border border-border bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"
          onClick={onSyncRequest}
          disabled={syncing}
        >
          {syncing ? 'Syncing…' : 'Sync Sources'}
        </button>
      </div>
    </header>
  )
}

export default Header

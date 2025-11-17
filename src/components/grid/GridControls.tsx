import type { Direction } from '@/types/grid.types'

interface GridControlsProps {
  direction: Direction
  elapsedSeconds: number
  onToggleDirection: () => void
  onReset: () => void
  onValidate: () => void
  statusMessage?: string
  solved?: boolean
}

function GridControls({
  direction,
  elapsedSeconds,
  onToggleDirection,
  onReset,
  onValidate,
  statusMessage,
  solved,
}: GridControlsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Direction</p>
          <p className="text-lg font-semibold">{direction === 'across' ? 'Across' : 'Down'}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Timer</p>
          <p className="text-lg font-semibold tabular-nums">{formatDuration(elapsedSeconds)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
          onClick={onToggleDirection}
        >
          Toggle Direction
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
          onClick={onValidate}
        >
          Check Puzzle
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-destructive bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
          onClick={onReset}
        >
          Reset Grid
        </button>
      </div>
      {statusMessage && (
        <p className={`text-sm ${solved ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
          {statusMessage}
        </p>
      )}
    </div>
  )
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default GridControls

import type { PuzzleSource, SourceStatus } from '@/types/source.types'

interface SourceCardProps {
  source: PuzzleSource
  status?: SourceStatus
  onToggle: (sourceId: string, enabled: boolean) => void
  onDownload: (sourceId: string) => void
}

function SourceCard({ source, status, onToggle, onDownload }: SourceCardProps) {
  const enabled = status?.enabled ?? source.defaultEnabled
  const lastSyncedAt = status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : 'Never'

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{source.name}</p>
          <p className="text-xs text-muted-foreground">{source.frequency} · {source.format.toUpperCase()}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(source.id, !enabled)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200' : 'bg-muted text-muted-foreground'}`}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Last sync</p>
          <p>{lastSyncedAt}</p>
        </div>
        {status?.lastError && <p className="text-xs text-destructive">{status.lastError}</p>}
      </div>
      <button
        type="button"
        className="rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium disabled:opacity-50"
        onClick={() => onDownload(source.id)}
        disabled={!enabled}
      >
        Download Latest
      </button>
    </div>
  )
}

export default SourceCard

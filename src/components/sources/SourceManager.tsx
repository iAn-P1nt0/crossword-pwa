import { useMemo, useState } from 'react'
import useSourcesStore from '@/stores/useSourcesStore'
import useSettingsStore from '@/stores/useSettingsStore'
import SourceCard from './SourceCard'
import { requestSourceSync, triggerManualSync } from '@/services/sync/syncService'
import { remoteSyncEnabled } from '@/config/runtimeConfig'

function SourceManager() {
  const sources = useSourcesStore((state) => state.sources)
  const statusMap = useSourcesStore((state) => state.status)
  const toggleSource = useSourcesStore((state) => state.toggleSource)
  const initialized = useSourcesStore((state) => state.initialized)
  const isOnline = useSettingsStore((state) => state.isOnline)
  const [syncing, setSyncing] = useState(false)

  const enabledSources = useMemo(
    () => sources.filter((source) => statusMap[source.id]?.enabled ?? source.defaultEnabled),
    [sources, statusMap],
  )

  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      await triggerManualSync()
    } finally {
      setSyncing(false)
    }
  }

  const handleDownload = async (sourceId: string) => {
    await requestSourceSync(sourceId)
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sources</p>
          <h2 className="text-xl font-semibold">{enabledSources.length} enabled</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          onClick={handleSyncAll}
          disabled={!initialized || !isOnline || syncing || !remoteSyncEnabled}
        >
          {remoteSyncEnabled ? (syncing ? 'Syncing…' : 'Sync all') : 'Sync disabled'}
        </button>
      </header>
      {!isOnline && <p className="text-sm text-amber-600 dark:text-amber-400">Offline mode — sync resumes when online.</p>}
      {!remoteSyncEnabled && (
        <p className="text-sm text-muted-foreground">
          Remote downloads are disabled for local development. Set <code className="rounded bg-muted px-1 py-0.5 text-xs">VITE_ENABLE_REMOTE_SOURCES=true</code> and restart the dev server to enable real source sync.
        </p>
      )}
      <div className="space-y-3">
        {sources.map((source) => (
          <SourceCard
            key={source.id}
            source={source}
            status={statusMap[source.id]}
            onToggle={toggleSource}
            onDownload={handleDownload}
            disabled={!remoteSyncEnabled || !isOnline}
          />
        ))}
      </div>
    </section>
  )
}

export default SourceManager

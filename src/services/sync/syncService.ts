import useSourcesStore from '@/stores/useSourcesStore'
import useSettingsStore from '@/stores/useSettingsStore'
import { getSourceById } from '@/services/api/sourceRegistry'
import { enqueueDownload } from './downloadManager'
import { remoteSyncEnabled } from '@/config/runtimeConfig'

let syncTimer: number | null = null

export async function triggerManualSync() {
  if (!remoteSyncEnabled) {
    console.info('Remote sync disabled. Set VITE_ENABLE_REMOTE_SOURCES=true to enable downloads.')
    return
  }
  const sourcesStore = useSourcesStore.getState()
  const settings = useSettingsStore.getState()
  if (!settings.isOnline) {
    return
  }

  const enabledSources = sourcesStore.sources.filter((source) => {
    const status = sourcesStore.status[source.id]
    return status ? status.enabled : source.defaultEnabled
  })

  await Promise.all(enabledSources.map((source) => enqueueDownload(source).catch(() => undefined)))
}

export async function requestSourceSync(sourceId: string) {
  if (!remoteSyncEnabled) {
    await useSourcesStore.getState().recordSyncResult(sourceId, false, 'Remote sync disabled in dev')
    return
  }
  const source = getSourceById(sourceId)
  if (!source) {
    throw new Error(`Unknown source: ${sourceId}`)
  }
  const { isOnline } = useSettingsStore.getState()
  if (!isOnline) return
  await enqueueDownload(source).catch(() => undefined)
}

export function startSyncService(options: { intervalMinutes?: number } = {}) {
  const intervalMinutes = options.intervalMinutes ?? 30
  if (typeof window === 'undefined') return
  if (!remoteSyncEnabled) return
  stopSyncService()
  syncTimer = window.setInterval(() => {
    void triggerManualSync()
  }, intervalMinutes * 60_000)
}

export function stopSyncService() {
  if (syncTimer) {
    if (typeof window !== 'undefined') {
      window.clearInterval(syncTimer)
    }
    syncTimer = null
  }
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'REQUEST_SYNC') {
      void triggerManualSync()
    }
  })
}

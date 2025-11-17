import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import PuzzleViewer from '@/components/layout/PuzzleViewer'
import SourceManager from '@/components/sources/SourceManager'
import TestDownload from '@/components/debug/TestDownload'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { usePuzzleState } from '@/hooks/usePuzzleState'
import { useKeyboard } from '@/hooks/useKeyboard'
import usePuzzleStore from '@/stores/usePuzzleStore'
import useSettingsStore from '@/stores/useSettingsStore'
import useSourcesStore from '@/stores/useSourcesStore'
import useStatsStore from '@/stores/useStatsStore'
import type { PuzzleData } from '@/types/puzzle.types'
import { getRecentPuzzles } from '@/services/storage/puzzleStorage'
import { startSyncService, stopSyncService, triggerManualSync } from '@/services/sync/syncService'
import { remoteSyncEnabled } from '@/config/runtimeConfig'

function App() {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const hydrateSettings = useSettingsStore((state) => state.hydrate)
  const hydrateStats = useStatsStore((state) => state.hydrate)
  const initializeSources = useSourcesStore((state) => state.initialize)
  const currentPuzzle = usePuzzleStore((state) => state.currentPuzzle)

  usePuzzleState(activePuzzle)
  useOfflineSync()
  useKeyboard(Boolean(currentPuzzle))

  useEffect(() => {
    void hydrateSettings()
    void hydrateStats()
    void initializeSources()
  }, [hydrateSettings, hydrateStats, initializeSources])

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const [latest] = await getRecentPuzzles(1)
      if (!cancelled && latest?.data) {
        setActivePuzzle(latest.data)
      }
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<PuzzleData>
      if (custom.detail) {
        setActivePuzzle(custom.detail)
      }
    }
    window.addEventListener('puzzle:downloaded', handler)
    return () => window.removeEventListener('puzzle:downloaded', handler)
  }, [])

  useEffect(() => {
    if (!remoteSyncEnabled) {
      return undefined
    }
    startSyncService({ intervalMinutes: 60 })
    return () => stopSyncService()
  }, [])

  const handleSyncRequest = async () => {
    if (!remoteSyncEnabled) return
    setSyncing(true)
    try {
      await triggerManualSync()
    } finally {
      setSyncing(false)
    }
  }

  // Show test page if testMode is enabled
  if (testMode) {
    return (
      <div>
        <button
          onClick={() => setTestMode(false)}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to App
        </button>
        <TestDownload />
      </div>
    )
  }

  return (
    <>
      {remoteSyncEnabled && (
        <button
          onClick={() => setTestMode(true)}
          className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Open download test page"
        >
          🧪 Test
        </button>
      )}
      <AppLayout
        header={<Header onSyncRequest={handleSyncRequest} syncing={syncing} />}
        primary={<PuzzleViewer />}
        sidebar={<SourceManager />}
      />
    </>
  )
}

export default App

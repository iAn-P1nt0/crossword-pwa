import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import PuzzleViewer from '@/components/layout/PuzzleViewer'
import SourceManager from '@/components/sources/SourceManager'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { usePuzzleState } from '@/hooks/usePuzzleState'
import { useKeyboard } from '@/hooks/useKeyboard'
import usePuzzleStore from '@/stores/usePuzzleStore'
import useSettingsStore from '@/stores/useSettingsStore'
import useSourcesStore from '@/stores/useSourcesStore'
import useStatsStore from '@/stores/useStatsStore'
import type { PuzzleData } from '@/types/puzzle.types'
import { getRecentPuzzles } from '@/services/storage/puzzleStorage'
import { triggerManualSync } from '@/services/sync/syncService'

function App() {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleData | null>(null)
  const [syncing, setSyncing] = useState(false)
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
    window.addEventListener('puzzle:downloaded', handler as EventListener)
    return () => window.removeEventListener('puzzle:downloaded', handler as EventListener)
  }, [])

  const handleSyncRequest = async () => {
    setSyncing(true)
    try {
      await triggerManualSync()
    } finally {
      setSyncing(false)
    }
  }

  return (
    <AppLayout
      header={<Header onSyncRequest={handleSyncRequest} syncing={syncing} />}
      primary={<PuzzleViewer />}
      sidebar={<SourceManager />}
    />
  )
}

export default App

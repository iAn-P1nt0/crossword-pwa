import { useEffect } from 'react'
import useStatsStore from '@/stores/useStatsStore'

export function useStats(puzzleId?: string) {
  const stats = useStatsStore((state) => (puzzleId ? state.stats[puzzleId] : undefined))
  const recordAttempt = useStatsStore((state) => state.recordAttempt)
  const recordCompletion = useStatsStore((state) => state.recordCompletion)

  useEffect(() => {
    if (!puzzleId) return
    void recordAttempt(puzzleId)
  }, [puzzleId, recordAttempt])

  return {
    stats,
    recordCompletion,
    totalSolved: useStatsStore((state) => state.totalSolved),
    currentStreak: useStatsStore((state) => state.currentStreak),
  }
}

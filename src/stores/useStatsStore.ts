import { create } from 'zustand'
import { getSetting, setSetting } from '@/services/storage/settingsStorage'
import type { PuzzleStatsSnapshot } from '@/types/puzzle.types'

const STATS_KEY = 'puzzle-stats'

type StoredPuzzleStats = PuzzleStatsSnapshot & {
  attempts: number
  bestTime?: number
}

interface PersistedStatsState {
  stats: Record<string, StoredPuzzleStats>
  totalSolved: number
  currentStreak: number
}

interface StatsStoreState {
  stats: Record<string, StoredPuzzleStats>
  totalSolved: number
  currentStreak: number
  hydrate: () => Promise<void>
  recordAttempt: (puzzleId: string) => Promise<void>
  recordCompletion: (puzzleId: string, elapsedSeconds: number) => Promise<void>
  resetStreak: () => Promise<void>
}

const useStatsStore = create<StatsStoreState>((set, get) => ({
  stats: {},
  totalSolved: 0,
  currentStreak: 0,
  hydrate: async () => {
    const persisted = await getSetting<PersistedStatsState>(STATS_KEY)
    if (persisted) {
      set((state) => ({
        ...state,
        stats: persisted.stats,
        totalSolved: persisted.totalSolved,
        currentStreak: persisted.currentStreak,
      }))
    }
  },
  recordAttempt: async (puzzleId) => {
    set((state) => {
      const existing = state.stats[puzzleId] ?? createStatsSnapshot(puzzleId)
      const next: StoredPuzzleStats = { ...existing, attempts: existing.attempts + 1 }
      return {
        ...state,
        stats: {
          ...state.stats,
          [puzzleId]: next,
        },
      }
    })
    await persistStats(get())
  },
  recordCompletion: async (puzzleId, elapsedSeconds) => {
    set((state) => {
      const existing = state.stats[puzzleId] ?? createStatsSnapshot(puzzleId)
      const finishedAt = new Date().toISOString()
      const bestTime = typeof existing.bestTime === 'number'
        ? Math.min(existing.bestTime, elapsedSeconds)
        : elapsedSeconds
      const next: StoredPuzzleStats = {
        ...existing,
        isCompleted: true,
        completionRate: 1,
        incorrectCells: existing.incorrectCells ?? 0,
        hintCount: existing.hintCount ?? 0,
        finishedAt,
        bestTime,
      }
      return {
        stats: {
          ...state.stats,
          [puzzleId]: next,
        },
        totalSolved: state.totalSolved + (existing.isCompleted ? 0 : 1),
        currentStreak: state.currentStreak + 1,
      }
    })
    await persistStats(get())
  },
  resetStreak: async () => {
    set({ currentStreak: 0 })
    await persistStats(get())
  },
}))

function createStatsSnapshot(puzzleId: string): StoredPuzzleStats {
  const now = new Date().toISOString()
  return {
    puzzleId,
    isCompleted: false,
    completionRate: 0,
    incorrectCells: 0,
    hintCount: 0,
    startedAt: now,
    attempts: 0,
  }
}

async function persistStats(state: StatsStoreState) {
  const payload: PersistedStatsState = {
    stats: state.stats,
    totalSolved: state.totalSolved,
    currentStreak: state.currentStreak,
  }
  await setSetting(STATS_KEY, payload)
}

export default useStatsStore

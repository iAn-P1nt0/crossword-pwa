import { useEffect } from 'react'
import usePuzzleStore from '@/stores/usePuzzleStore'
import { getProgress } from '@/services/storage/puzzleStorage'
import type { PuzzleData } from '@/types/puzzle.types'

export function usePuzzleState(puzzle?: PuzzleData | null) {
  const loadPuzzle = usePuzzleStore((state) => state.loadPuzzle)

  useEffect(() => {
    if (!puzzle) return
    let cancelled = false
    const activePuzzle = puzzle
    async function hydrate() {
      const saved = await getProgress(activePuzzle.puzzleId)
      if (!cancelled) {
        loadPuzzle(activePuzzle, saved ?? undefined)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [puzzle, loadPuzzle])

  return usePuzzleStore()
}

import { useEffect } from 'react'
import usePuzzleStore from '@/stores/usePuzzleStore'
import { getProgress } from '@/services/storage/puzzleStorage'
import type { PuzzleData } from '@/types/puzzle.types'

export function usePuzzleState(puzzle?: PuzzleData | null) {
  const loadPuzzle = usePuzzleStore((state) => state.loadPuzzle)

  useEffect(() => {
    if (!puzzle) return
    let cancelled = false
    async function hydrate() {
      const saved = await getProgress(puzzle.puzzleId)
      if (!cancelled) {
        loadPuzzle(puzzle, saved ?? undefined)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [puzzle?.puzzleId, loadPuzzle, puzzle])

  return usePuzzleStore()
}

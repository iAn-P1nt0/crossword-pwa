import type { PuzzleClue } from '@/types/puzzle.types'
import { getAdjacentClue } from '@/utils/gridCalculations'

interface ClueNavigationProps {
  clues: PuzzleClue[]
  activeClueId?: string
  onSelect: (clue: PuzzleClue) => void
}

function ClueNavigation({ clues, activeClueId, onSelect }: ClueNavigationProps) {
  const handlePrev = () => {
    const prev = getAdjacentClue(clues, activeClueId, -1)
    if (prev) onSelect(prev)
  }

  const handleNext = () => {
    const next = getAdjacentClue(clues, activeClueId, 1)
    if (next) onSelect(next)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
        onClick={handlePrev}
        disabled={!clues.length}
      >
        Previous
      </button>
      <button
        type="button"
        className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
        onClick={handleNext}
        disabled={!clues.length}
      >
        Next
      </button>
    </div>
  )
}

export default ClueNavigation

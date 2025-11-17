import type { PuzzleClue } from '@/types/puzzle.types'
import { cn } from '@/lib/utils'

interface ClueItemProps {
  clue: PuzzleClue
  isActive: boolean
  onSelect: (clue: PuzzleClue) => void
}

function ClueItem({ clue, isActive, onSelect }: ClueItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(clue)}
      className={cn(
        'w-full rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors',
        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {clue.number}
      </span>
      <p className="font-medium text-foreground">{clue.text}</p>
      {clue.annotation && <p className="text-xs text-muted-foreground">{clue.annotation}</p>}
    </button>
  )
}

export default ClueItem

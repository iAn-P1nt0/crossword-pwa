import type { PuzzleClue } from '@/types/puzzle.types'
import ClueItem from './ClueItem'

interface ClueListProps {
  title: string
  clues: PuzzleClue[]
  activeClueId?: string
  onSelect: (clue: PuzzleClue) => void
}

function ClueList({ title, clues, activeClueId, onSelect }: ClueListProps) {
  return (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{clues.length} clues</span>
      </header>
      <div className="flex-1 space-y-1 overflow-auto pr-1">
        {clues.map((clue) => (
          <ClueItem key={clue.id} clue={clue} isActive={clue.id === activeClueId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export default ClueList

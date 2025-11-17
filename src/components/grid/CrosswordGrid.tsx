import type { CrosswordCell, GridPosition, HighlightState } from '@/types/grid.types'
import CrosswordCellComponent from './CrosswordCell'
import { cellKey } from '@/utils/gridCalculations'

interface CrosswordGridProps {
  grid: CrosswordCell[][]
  focusedCell?: GridPosition | null
  highlights?: HighlightState
  onSelectCell: (position: GridPosition) => void
  cellSize?: number
}

function CrosswordGrid({ grid, focusedCell, highlights, onSelectCell, cellSize = 36 }: CrosswordGridProps) {
  if (!grid.length) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-muted-foreground/40">
        <p className="text-sm text-muted-foreground">No puzzle loaded yet.</p>
      </div>
    )
  }

  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  const width = cols * cellSize
  const height = rows * cellSize
  const primary = highlights?.primary ?? new Set<string>()

  return (
    <div className="w-full overflow-auto rounded-xl border border-border bg-card p-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="grid"
        aria-label="Crossword grid"
        className="mx-auto block max-h-[640px]"
      >
        {grid.map((row) =>
          row.map((cell) => (
            <CrosswordCellComponent
              key={cell.id}
              cell={cell}
              size={cellSize}
              isFocused={focusedCell ? cell.row === focusedCell.row && cell.col === focusedCell.col : false}
              isHighlighted={primary.has(cellKey({ row: cell.row, col: cell.col }))}
              onSelect={onSelectCell}
            />
          )),
        )}
      </svg>
    </div>
  )
}

export default CrosswordGrid

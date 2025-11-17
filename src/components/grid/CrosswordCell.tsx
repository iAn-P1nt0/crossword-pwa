import type { CrosswordCell as Cell, GridPosition } from '@/types/grid.types'
import { cn } from '@/lib/utils'

interface CrosswordCellProps {
  cell: Cell
  size: number
  isFocused: boolean
  isHighlighted: boolean
  onSelect: (position: GridPosition) => void
}

function CrosswordCell({ cell, size, isFocused, isHighlighted, onSelect }: CrosswordCellProps) {
  const { row, col } = cell

  const handlePointer = () => {
    if (!cell.isBlock) {
      onSelect({ row, col })
    }
  }

  const cellClasses = cn(
    'cursor-pointer transition-colors',
    cell.isBlock ? 'fill-foreground' : 'fill-card',
    isHighlighted && !cell.isBlock && 'fill-muted',
  )

  const strokeClasses = cn('stroke-border', isFocused && 'stroke-primary stroke-2')

  const labelFontSize = Math.max(8, size * 0.25)
  const valueFontSize = Math.max(14, size * 0.55)

  return (
    <g onClick={handlePointer} onPointerDown={handlePointer}>
      <rect
        x={col * size}
        y={row * size}
        width={size}
        height={size}
        className={cellClasses}
        rx={2}
        ry={2}
      />
      <rect
        x={col * size}
        y={row * size}
        width={size}
        height={size}
        fill="transparent"
        className={strokeClasses}
        strokeWidth={isFocused ? 2 : 1}
      />
      {cell.clueNumber != null && !cell.isBlock && (
        <text
          x={col * size + size * 0.15}
          y={row * size + size * 0.35}
          fontSize={labelFontSize}
          fill="currentColor"
          className="text-[10px]"
        >
          {cell.clueNumber}
        </text>
      )}
      {!cell.isBlock && (
        <text
          x={col * size + size / 2}
          y={row * size + size * 0.7}
          fontSize={valueFontSize}
          textAnchor="middle"
          fill="currentColor"
          className="font-semibold"
        >
          {(cell.value ?? '').toUpperCase()}
        </text>
      )}
    </g>
  )
}

export default CrosswordCell

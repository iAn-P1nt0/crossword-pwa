import type { CrosswordCell, Direction, GridPosition, HighlightState } from '@/types/grid.types'
import type { PuzzleClue } from '@/types/puzzle.types'

export function cellsForClue(clue: PuzzleClue): GridPosition[] {
  const cells: GridPosition[] = []
  for (let index = 0; index < clue.length; index += 1) {
    cells.push(
      clue.direction === 'across'
        ? { row: clue.row, col: clue.col + index }
        : { row: clue.row + index, col: clue.col },
    )
  }
  return cells
}

export function findClueForCell(clues: PuzzleClue[], position?: GridPosition | null) {
  if (!position) return undefined
  return clues.find((clue) => isCellInClue(clue, position))
}

export function isCellInClue(clue: PuzzleClue, position: GridPosition) {
  return cellsForClue(clue).some((cell) => cell.row === position.row && cell.col === position.col)
}

export function buildHighlightState(activeClue?: PuzzleClue, focusedCell?: GridPosition | null): HighlightState {
  const primary = new Set<string>()
  const secondary = new Set<string>()

  if (activeClue) {
    for (const cell of cellsForClue(activeClue)) {
      primary.add(cellKey(cell))
    }
  }

  if (focusedCell) {
    secondary.add(cellKey(focusedCell))
  }

  return { primary, secondary }
}

export function getAdjacentClue(
  clues: PuzzleClue[],
  currentId?: string,
  delta = 1,
): PuzzleClue | undefined {
  if (!clues.length) return undefined
  const index = currentId ? clues.findIndex((clue) => clue.id === currentId) : -1
  const nextIndex = index === -1 ? 0 : clamp(index + delta, 0, clues.length - 1)
  return clues[nextIndex]
}

export function getDirectionClues(direction: Direction, puzzle?: { cluesAcross: PuzzleClue[]; cluesDown: PuzzleClue[] }) {
  if (!puzzle) return []
  return direction === 'across' ? puzzle.cluesAcross : puzzle.cluesDown
}

export function cellKey(position: GridPosition) {
  return `${position.row}-${position.col}`
}

export function mapGridCells(grid: CrosswordCell[][]) {
  const map = new Map<string, CrosswordCell>()
  for (const row of grid) {
    for (const cell of row) {
      map.set(cellKey({ row: cell.row, col: cell.col }), cell)
    }
  }
  return map
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
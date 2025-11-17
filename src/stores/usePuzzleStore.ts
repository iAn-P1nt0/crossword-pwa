import { create } from 'zustand'
import type { CrosswordCell, Direction, GridPosition } from '@/types/grid.types'
import type { PuzzleData, PuzzleProgress } from '@/types/puzzle.types'
import { upsertProgress } from '@/services/storage/puzzleStorage'

interface PuzzleStoreState {
  currentPuzzle: PuzzleData | null
  grid: CrosswordCell[][]
  direction: Direction
  focusedCell: GridPosition | null
  errors: string[]
  revealedCells: string[]
  elapsedSeconds: number
  loadPuzzle: (puzzle: PuzzleData, progress?: PuzzleProgress | null) => void
  updateCell: (row: number, col: number, value: string) => void
  setFocus: (position: GridPosition | null) => void
  moveFocus: (deltaRow: number, deltaCol: number) => void
  toggleDirection: () => void
  resetPuzzle: () => void
  validatePuzzle: () => boolean
  incrementTimer: (seconds?: number) => void
}

const usePuzzleStore = create<PuzzleStoreState>((set, get) => ({
  currentPuzzle: null,
  grid: [],
  direction: 'across',
  focusedCell: null,
  errors: [],
  revealedCells: [],
  elapsedSeconds: 0,
  loadPuzzle: (puzzle, progress) => {
    const grid = clonePuzzleGrid(puzzle, progress)
    set({
      currentPuzzle: puzzle,
      grid,
      direction: progress?.direction ?? 'across',
      focusedCell: progress?.focusedCell ?? null,
      errors: progress?.errors ?? [],
      revealedCells: progress?.revealedCells ?? [],
      elapsedSeconds: progress?.elapsedSeconds ?? 0,
    })
  },
  updateCell: (row, col, value) => {
    set((state) => {
      if (!state.currentPuzzle || !state.grid[row] || !state.grid[row][col]) {
        return state
      }
      const normalized = normalizeEntry(value)
      const nextGrid = state.grid.map((cells, r) =>
        cells.map((cell, c) => (r === row && c === col ? { ...cell, value: normalized } : cell)),
      )
      return { ...state, grid: nextGrid }
    })
    void persistProgressSnapshot(get())
  },
  setFocus: (position) => {
    set({ focusedCell: position })
    void persistProgressSnapshot(get())
  },
  moveFocus: (deltaRow, deltaCol) => {
    const { focusedCell, grid } = get()
    if (!focusedCell) return
    const target = findNextCell(grid, focusedCell, deltaRow, deltaCol)
    set({ focusedCell: target })
    void persistProgressSnapshot(get())
  },
  toggleDirection: () => {
    set((state) => ({ direction: state.direction === 'across' ? 'down' : 'across' }))
    void persistProgressSnapshot(get())
  },
  resetPuzzle: () => {
    const puzzle = get().currentPuzzle
    if (!puzzle) return
    const grid = clonePuzzleGrid(puzzle)
    set({ grid, errors: [], revealedCells: [], focusedCell: null, elapsedSeconds: 0 })
    void persistProgressSnapshot(get())
  },
  validatePuzzle: () => {
    const { grid } = get()
    for (const row of grid) {
      for (const cell of row) {
        if (!cell.isBlock && (cell.value ?? '').toUpperCase() !== (cell.solution ?? '')) {
          return false
        }
      }
    }
    return true
  },
  incrementTimer: (seconds = 1) => {
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + seconds }))
    void persistProgressSnapshot(get())
  },
}))

function clonePuzzleGrid(puzzle: PuzzleData, progress?: PuzzleProgress | null) {
  const entries = progress?.gridEntries ?? {}
  return puzzle.grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      value: entries[cell.id] ?? cell.value ?? '',
    })),
  )
}

function normalizeEntry(value: string) {
  return value.trim().slice(0, 1).toUpperCase()
}

function findNextCell(grid: CrosswordCell[][], start: GridPosition, deltaRow: number, deltaCol: number) {
  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  let row = start.row + deltaRow
  let col = start.col + deltaCol

  while (row >= 0 && row < rows && col >= 0 && col < cols) {
    const cell = grid[row][col]
    if (cell && !cell.isBlock) {
      return { row, col }
    }
    row += deltaRow
    col += deltaCol
  }

  return start
}

async function persistProgressSnapshot(state: PuzzleStoreState) {
  if (!state.currentPuzzle) return
  const snapshot: PuzzleProgress = {
    puzzleId: state.currentPuzzle.puzzleId,
    gridEntries: buildGridEntries(state.grid),
    errors: state.errors,
    revealedCells: state.revealedCells,
    focusedCell: state.focusedCell ?? undefined,
    selection: undefined,
    direction: state.direction,
    updatedAt: new Date().toISOString(),
    elapsedSeconds: state.elapsedSeconds,
  }
  await upsertProgress(snapshot)
}

function buildGridEntries(grid: CrosswordCell[][]) {
  const entries: Record<string, string> = {}
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.isBlock && cell.value) {
        entries[cell.id] = cell.value
      }
    }
  }
  return entries
}

export default usePuzzleStore

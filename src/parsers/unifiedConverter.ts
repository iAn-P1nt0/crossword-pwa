import type { Clue as UnifiedClue, Puzzle as UnifiedPuzzle } from '@xwordly/xword-parser'
import type { CrosswordCell, Direction } from '@/types/grid.types'
import type { PuzzleClue, PuzzleData, PuzzleMetadata } from '@/types/puzzle.types'
import type { PuzzleFormat } from '@/types/source.types'

const UNKNOWN_SOURCE_ID = 'imported'
const UNKNOWN_SOURCE_NAME = 'Imported Puzzle'

export function convertUnifiedPuzzle(unified: UnifiedPuzzle, format: PuzzleFormat): PuzzleData {
  const timestamp = new Date().toISOString()
  const rows = unified.grid.height ?? unified.grid.cells.length
  const cols = unified.grid.width ?? unified.grid.cells[0]?.length ?? 0

  const grid = unified.grid.cells.map((row, r) =>
    row.map((cell, c): CrosswordCell => ({
      id: `${r}-${c}`,
      row: r,
      col: c,
      isBlock: cell.isBlack,
      solution: cell.solution?.toUpperCase(),
      clueNumber: cell.number,
      annotation: cell.isCircled ? 'circled' : undefined,
    })),
  )

  const cellBlocks = grid.map((row) => row.map((cell) => cell.isBlock))

  const cluesAcross = buildClues('across', grid, unified.clues.across)
  const cluesDown = buildClues('down', grid, unified.clues.down)

  const metadata = buildMetadata(unified)

  return {
    puzzleId: generatePuzzleId(format, metadata.title),
    format,
    metadata,
    dimensions: { rows, cols },
    grid,
    cluesAcross,
    cluesDown,
    cellBlocks,
    checksum: typeof unified.additionalProperties?.checksum === 'string' ? unified.additionalProperties.checksum : undefined,
    references: unified.rebusTable ? Array.from(unified.rebusTable.entries()).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[`rebus-${key}`] = value
      return acc
    }, {}) : undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function buildMetadata(unified: UnifiedPuzzle): PuzzleMetadata {
  const now = new Date().toISOString()
  const publishedDate = normalizeDate(unified.date) ?? now

  return {
    title: unified.title ?? 'Untitled Puzzle',
    author: unified.author ?? 'Unknown',
    editor: undefined,
    publisher: typeof unified.additionalProperties?.publisher === 'string' ? unified.additionalProperties.publisher : undefined,
    sourceId: (unified.additionalProperties?.sourceId as string) ?? UNKNOWN_SOURCE_ID,
    sourceName: (unified.additionalProperties?.sourceName as string) ?? UNKNOWN_SOURCE_NAME,
    publishedDate,
    difficulty: undefined,
    notes: unified.notes,
  }
}

function buildClues(direction: Direction, grid: CrosswordCell[][], clues: UnifiedClue[]): PuzzleClue[] {
  const textByNumber = new Map<number, string>()
  for (const clue of clues) {
    textByNumber.set(clue.number, clue.text)
  }

  const rows = grid.length
  const cols = grid[0]?.length ?? 0
  if (rows === 0 || cols === 0) return []
  const results: PuzzleClue[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = grid[row][col]
      if (cell.isBlock || cell.clueNumber == null) continue

      const isStart = isStartOfWord(direction, grid, row, col)
      if (!isStart) continue

      const { length, answer } = measureAnswer(direction, grid, row, col, cols)
      const number = cell.clueNumber

      results.push({
        id: `${direction}-${number}`,
        number,
        direction,
        text: textByNumber.get(number) ?? '',
        answer,
        row,
        col,
        length,
      })
    }
  }

  return results
}

function isStartOfWord(direction: Direction, grid: CrosswordCell[][], row: number, col: number) {
  if (direction === 'across') {
    return (col === 0 || grid[row][col - 1].isBlock) && (col < grid[row].length)
  }

  return (row === 0 || grid[row - 1][col].isBlock) && (row < grid.length)
}

function measureAnswer(direction: Direction, grid: CrosswordCell[][], row: number, col: number, maxCols: number) {
  let length = 0
  let answer = ''
  let r = row
  let c = col

  while (r < grid.length && c < maxCols && !grid[r][c].isBlock) {
    length += 1
    answer += grid[r][c].solution ?? ''
    if (direction === 'across') {
      c += 1
    } else {
      r += 1
    }
  }

  return { length, answer }
}

function generatePuzzleId(format: PuzzleFormat, title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${format}-${base || 'puzzle'}-${suffix}`
}

function normalizeDate(value?: string) {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

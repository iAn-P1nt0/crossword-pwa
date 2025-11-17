import type { ActiveSelection, CrosswordCell, Direction, GridDimensions, GridPosition } from './grid.types'
import type { PuzzleFormat, SourceCategory } from './source.types'

export interface PuzzleMetadata {
  title: string
  author: string
  editor?: string
  publisher?: string
  sourceId: string
  sourceName: string
  publishedDate: string
  difficulty?: string
  tags?: string[]
  notes?: string
}

export interface PuzzleClue {
  id: string
  number: number
  direction: Direction
  text: string
  answer?: string
  row: number
  col: number
  length: number
  groupId?: string
  annotation?: string
}

export interface PuzzleData {
  puzzleId: string
  format: PuzzleFormat
  metadata: PuzzleMetadata
  dimensions: GridDimensions
  grid: CrosswordCell[][]
  cluesAcross: PuzzleClue[]
  cluesDown: PuzzleClue[]
  cellBlocks: boolean[][]
  checksum?: string
  references?: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

export interface PuzzleProgress {
  puzzleId: string
  gridEntries: Record<string, string>
  errors: string[]
  revealedCells: string[]
  focusedCell?: GridPosition
  selection?: ActiveSelection
  direction: Direction
  updatedAt?: string
  elapsedSeconds: number
}

export interface PuzzleStatsSnapshot {
  puzzleId: string
  isCompleted: boolean
  completionRate: number
  incorrectCells: number
  hintCount: number
  startedAt: string
  finishedAt?: string
}

export interface ParseResult {
  success: boolean
  data?: PuzzleData
  warnings?: string[]
  error?: string
  sourceCategory?: SourceCategory
}

export type Direction = 'across' | 'down'

export interface GridDimensions {
  rows: number
  cols: number
}

export interface GridPosition {
  row: number
  col: number
}

export interface CrosswordCell {
  id: string
  row: number
  col: number
  /** True when the cell is a black square or barrier. */
  isBlock: boolean
  /** Solution letter provided by the puzzle file. */
  solution?: string
  /** Player-entered value persisted in progress. */
  value?: string
  /** Number that appears in the top-left of the cell. */
  clueNumber?: number
  /** Additional metadata for rebus entries or circled squares. */
  annotation?: string
  isRevealed?: boolean
  isIncorrect?: boolean
}

export interface ActiveSelection {
  puzzleId: string
  direction: Direction
  anchor: GridPosition
  cells: GridPosition[]
}

export interface HighlightState {
  primary: Set<string>
  secondary: Set<string>
}

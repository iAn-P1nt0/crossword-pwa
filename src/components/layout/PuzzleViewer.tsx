import { useEffect, useMemo, useState } from 'react'
import CrosswordGrid from '@/components/grid/CrosswordGrid'
import GridControls from '@/components/grid/GridControls'
import ClueList from '@/components/clues/ClueList'
import ClueNavigation from '@/components/clues/ClueNavigation'
import VirtualKeyboard from '@/components/keyboard/VirtualKeyboard'
import usePuzzleStore from '@/stores/usePuzzleStore'
import { useStats } from '@/hooks/useStats'
import type { Direction, GridPosition } from '@/types/grid.types'
import type { PuzzleClue } from '@/types/puzzle.types'
import { buildHighlightState, findClueForCell, getDirectionClues } from '@/utils/gridCalculations'

function PuzzleViewer() {
  const {
    currentPuzzle,
    grid,
    direction,
    focusedCell,
    setFocus,
    toggleDirection,
    resetPuzzle,
    validatePuzzle,
    elapsedSeconds,
    incrementTimer,
  } = usePuzzleStore((state) => ({
    currentPuzzle: state.currentPuzzle,
    grid: state.grid,
    direction: state.direction,
    focusedCell: state.focusedCell,
    setFocus: state.setFocus,
    toggleDirection: state.toggleDirection,
    resetPuzzle: state.resetPuzzle,
    validatePuzzle: state.validatePuzzle,
    elapsedSeconds: state.elapsedSeconds,
    incrementTimer: state.incrementTimer,
  }))

  const { stats, recordCompletion } = useStats(currentPuzzle?.puzzleId)
  const [statusMessage, setStatusMessage] = useState<string>()
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    if (!currentPuzzle) return
    const timer = window.setInterval(() => {
      incrementTimer(1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [currentPuzzle, incrementTimer])

  useEffect(() => {
    setStatusMessage(undefined)
    setSolved(false)
  }, [currentPuzzle?.puzzleId])

  const activeClue = useMemo(() => {
    if (!currentPuzzle) return undefined
    const pool = getDirectionClues(direction, currentPuzzle)
    return findClueForCell(pool, focusedCell) ?? pool[0]
  }, [currentPuzzle, direction, focusedCell])

  const highlightState = useMemo(() => buildHighlightState(activeClue, focusedCell), [activeClue, focusedCell])

  const handleCellSelect = (position: GridPosition) => {
    setFocus(position)
  }

  const handleClueSelect = (clue: PuzzleClue) => {
    ensureDirection(clue.direction)
    setFocus({ row: clue.row, col: clue.col })
  }

  const ensureDirection = (target: Direction) => {
    if (direction !== target) {
      toggleDirection()
    }
  }

  const handleValidate = () => {
    const solvedPuzzle = validatePuzzle()
    setStatusMessage(solvedPuzzle ? '🎉 Puzzle solved! Great work.' : 'Still some letters to fix.')
    setSolved(solvedPuzzle)
    if (solvedPuzzle && currentPuzzle) {
      void recordCompletion(currentPuzzle.puzzleId, elapsedSeconds)
    }
  }

  const clueStats = currentPuzzle
    ? {
        across: currentPuzzle.cluesAcross.length,
        down: currentPuzzle.cluesDown.length,
      }
    : { across: 0, down: 0 }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <CrosswordGrid grid={grid} focusedCell={focusedCell} highlights={highlightState} onSelectCell={handleCellSelect} />
        <div className="flex flex-col gap-4">
          <GridControls
            direction={direction}
            elapsedSeconds={elapsedSeconds}
            onReset={resetPuzzle}
            onToggleDirection={toggleDirection}
            onValidate={handleValidate}
            statusMessage={statusMessage}
            solved={solved}
          />
          <StatsCard stats={stats} clueStats={clueStats} />
        </div>
      </section>

      <section className="space-y-4">
        <ClueNavigation
          clues={getDirectionClues(direction, currentPuzzle)}
          activeClueId={activeClue?.id}
          onSelect={handleClueSelect}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <ClueList title="Across" clues={currentPuzzle?.cluesAcross ?? []} activeClueId={activeClue?.id} onSelect={handleClueSelect} />
          <ClueList title="Down" clues={currentPuzzle?.cluesDown ?? []} activeClueId={activeClue?.id} onSelect={handleClueSelect} />
        </div>
      </section>

      <section className="md:hidden">
        <VirtualKeyboard visible={Boolean(currentPuzzle)} />
      </section>
    </div>
  )
}

interface StatsCardProps {
  stats?: {
    attempts: number
    bestTime?: number
    completionRate: number
    incorrectCells: number
    hintCount: number
  }
  clueStats: { across: number; down: number }
}

function StatsCard({ stats, clueStats }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</h3>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-muted-foreground">Attempts</dt>
          <dd className="text-lg font-semibold">{stats?.attempts ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Best time</dt>
          <dd className="text-lg font-semibold">{formatDuration(stats?.bestTime ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Across clues</dt>
          <dd className="text-lg font-semibold">{clueStats.across}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Down clues</dt>
          <dd className="text-lg font-semibold">{clueStats.down}</dd>
        </div>
      </dl>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default PuzzleViewer

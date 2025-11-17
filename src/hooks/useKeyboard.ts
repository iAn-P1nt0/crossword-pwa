import { useEffect } from 'react'
import usePuzzleStore from '@/stores/usePuzzleStore'

export function useKeyboard(enabled = true) {
  const direction = usePuzzleStore((state) => state.direction)
  const focusedCell = usePuzzleStore((state) => state.focusedCell)
  const updateCell = usePuzzleStore((state) => state.updateCell)
  const moveFocus = usePuzzleStore((state) => state.moveFocus)
  const toggleDirection = usePuzzleStore((state) => state.toggleDirection)

  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      if (!focusedCell) return

      if (/^[a-zA-Z]$/.test(event.key)) {
        updateCell(focusedCell.row, focusedCell.col, event.key)
        moveFocus(direction === 'across' ? 0 : 1, direction === 'across' ? 1 : 0)
        event.preventDefault()
        return
      }

      switch (event.key) {
        case 'Backspace':
          updateCell(focusedCell.row, focusedCell.col, '')
          moveFocus(direction === 'across' ? 0 : -1, direction === 'across' ? -1 : 0)
          event.preventDefault()
          break
        case 'ArrowRight':
          moveFocus(0, 1)
          event.preventDefault()
          break
        case 'ArrowLeft':
          moveFocus(0, -1)
          event.preventDefault()
          break
        case 'ArrowDown':
          moveFocus(1, 0)
          event.preventDefault()
          break
        case 'ArrowUp':
          moveFocus(-1, 0)
          event.preventDefault()
          break
        case ' ':
        case 'Tab':
          toggleDirection()
          event.preventDefault()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, direction, focusedCell, moveFocus, toggleDirection, updateCell])
}

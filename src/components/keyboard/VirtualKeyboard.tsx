import usePuzzleStore from '@/stores/usePuzzleStore'

interface VirtualKeyboardProps {
  visible?: boolean
}

const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

function VirtualKeyboard({ visible = true }: VirtualKeyboardProps) {
  const direction = usePuzzleStore((state) => state.direction)
  const focusedCell = usePuzzleStore((state) => state.focusedCell)
  const updateCell = usePuzzleStore((state) => state.updateCell)
  const moveFocus = usePuzzleStore((state) => state.moveFocus)
  const toggleDirection = usePuzzleStore((state) => state.toggleDirection)

  if (!visible || !focusedCell) {
    return null
  }

  const handleKey = (value: string) => {
    updateCell(focusedCell.row, focusedCell.col, value)
    moveFocus(direction === 'across' ? 0 : 1, direction === 'across' ? 1 : 0)
  }

  const handleBackspace = () => {
    updateCell(focusedCell.row, focusedCell.col, '')
    moveFocus(direction === 'across' ? 0 : -1, direction === 'across' ? -1 : 0)
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      {KEY_ROWS.map((row) => (
        <div key={row} className="flex justify-center gap-2">
          {row.split('').map((key) => (
            <button
              key={key}
              type="button"
              className="h-10 w-10 rounded-lg border border-border bg-muted text-sm font-semibold"
              onClick={() => handleKey(key)}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
          onClick={handleBackspace}
        >
          Backspace
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-medium"
          onClick={toggleDirection}
        >
          Switch {direction === 'across' ? 'Down' : 'Across'}
        </button>
      </div>
    </div>
  )
}

export default VirtualKeyboard

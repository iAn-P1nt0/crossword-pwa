import { useState } from 'react'
import { requestSourceSync } from '@/services/sync/syncService'
import { getSourceById } from '@/services/api/sourceRegistry'
import type { PuzzleData } from '@/types/puzzle.types'

function TestDownload() {
  const [status, setStatus] = useState<string>('Ready to test')
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTest = async (sourceId: string) => {
    setStatus(`Starting download for ${sourceId}...`)
    setError(null)
    setPuzzle(null)

    try {
      // Trigger the download
      await requestSourceSync(sourceId)
      setStatus(`Download initiated for ${sourceId}. Waiting for completion...`)

      // Wait a bit for the download to complete
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Try to fetch the most recent puzzle
      const source = getSourceById(sourceId)
      if (!source) {
        throw new Error(`Source ${sourceId} not found`)
      }

      setStatus(`Checking storage for downloaded puzzle...`)
      
      // The puzzle should have been persisted to IndexedDB
      // We'll listen for the custom event instead
      setStatus(`Download completed. Check browser console for details.`)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setStatus(`Failed: ${message}`)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Download Test</h1>
        <p className="text-sm text-muted-foreground">
          Test the full puzzle download → parse → store → display flow
        </p>
      </div>

      <div className="space-y-2">
        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && (
          <div className="text-red-600 dark:text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Test Sources</h2>
        
        <div className="space-y-2">
          <button
            onClick={() => handleTest('wsj-daily')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test WSJ Daily (PUZ)
          </button>
          
          <button
            onClick={() => handleTest('usa-today')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test USA Today (PUZ)
          </button>
          
          <button
            onClick={() => handleTest('joseph-crosswords')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Test Joseph Crosswords (iPUZ)
          </button>
        </div>
      </div>

      {puzzle && (
        <div className="mt-6 p-4 border border-border rounded">
          <h3 className="font-semibold mb-2">Downloaded Puzzle:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(puzzle, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Open browser console (F12)</li>
          <li>Click a test button above</li>
          <li>Watch console for network requests and parse output</li>
          <li>Check IndexedDB (Application tab → Storage → IndexedDB → CrosswordDB)</li>
          <li>Listen for 'puzzle:downloaded' custom event</li>
        </ol>
      </div>
    </div>
  )
}

export default TestDownload

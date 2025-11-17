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
        <h2 className="text-lg font-semibold">Test Free Sources (Daily)</h2>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTest('wsj-daily')}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            WSJ Daily
          </button>
          
          <button
            onClick={() => handleTest('usa-today')}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            USA Today
          </button>
          
          <button
            onClick={() => handleTest('la-times')}
            className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          >
            LA Times
          </button>
          
          <button
            onClick={() => handleTest('universal-crossword')}
            className="px-3 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
          >
            Universal
          </button>
          
          <button
            onClick={() => handleTest('newsday-stan-newman')}
            className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
          >
            Newsday
          </button>
          
          <button
            onClick={() => handleTest('crosSynergy-wapo')}
            className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            WaPo/CrosSynergy
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Test Weekly Sources (iPUZ)</h2>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTest('joseph-crosswords')}
            className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
          >
            Joseph Crosswords
          </button>
          
          <button
            onClick={() => handleTest('jonesin-crosswords')}
            className="px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm"
          >
            Jonesin'
          </button>
          
          <button
            onClick={() => handleTest('erik-agard')}
            className="px-3 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 text-sm"
          >
            Erik Agard
          </button>
          
          <button
            onClick={() => handleTest('chronicle-higher-education')}
            className="px-3 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 text-sm"
          >
            Chronicle HE
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Test Paid Sources (Auth Required)</h2>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleTest('nyt-premium')}
            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
          >
            NYT Premium
          </button>
          
          <button
            onClick={() => handleTest('wsj-premium')}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            WSJ Premium
          </button>
          
          <button
            onClick={() => handleTest('guardian-cryptic')}
            className="px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
          >
            Guardian Cryptic
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

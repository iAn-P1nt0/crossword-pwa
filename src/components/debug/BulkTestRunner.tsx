import { useState } from 'react'
import { requestSourceSync } from '@/services/sync/syncService'
import { ALL_SOURCES } from '@/services/api/sourceRegistry'

interface TestResult {
  sourceId: string
  sourceName: string
  status: 'pending' | 'running' | 'success' | 'failed'
  message?: string
  timestamp?: string
}

function BulkTestRunner() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string | null>(null)

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    
    // Initialize results
    const initialResults: TestResult[] = ALL_SOURCES.map(source => ({
      sourceId: source.id,
      sourceName: source.name,
      status: 'pending'
    }))
    setResults(initialResults)

    // Test each source sequentially
    for (let i = 0; i < ALL_SOURCES.length; i++) {
      const source = ALL_SOURCES[i]
      setCurrentTest(source.id)
      
      // Update status to running
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'running' } : r
      ))

      try {
        console.log(`\n========== Testing ${source.name} (${source.id}) ==========`)
        await requestSourceSync(source.id)
        
        // Wait a bit for the download to complete
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update to success
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'success', 
            message: 'Download initiated',
            timestamp: new Date().toISOString()
          } : r
        ))
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Test failed for ${source.name}:`, message)
        
        // Update to failed
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'failed', 
            message,
            timestamp: new Date().toISOString()
          } : r
        ))
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    setCurrentTest(null)
    console.log('\n========== All tests completed ==========')
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      case 'running': return 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      case 'success': return 'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200'
      case 'failed': return 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
    }
  }

  const successCount = results.filter(r => r.status === 'success').length
  const failedCount = results.filter(r => r.status === 'failed').length
  const pendingCount = results.filter(r => r.status === 'pending').length

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Bulk Source Test Runner</h1>
        <p className="text-sm text-muted-foreground">
          Test all {ALL_SOURCES.length} puzzle sources systematically
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isRunning ? '🔄 Testing...' : '▶️ Run All Tests'}
        </button>

        {results.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-semibold">✓ {successCount} succeeded</span>
            <span className="text-red-600 font-semibold">✗ {failedCount} failed</span>
            <span className="text-gray-600 font-semibold">⏳ {pendingCount} pending</span>
          </div>
        )}
      </div>

      {currentTest && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            Currently testing: {currentTest}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Test Results</h2>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-semibold">Source</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Message</th>
                  <th className="text-left p-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={result.sourceId} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                    <td className="p-3 font-medium">{result.sourceName}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs">{result.message || '-'}</td>
                    <td className="p-3 text-xs">
                      {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded">
        <h3 className="font-semibold mb-2">What to expect:</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Open browser console (F12) to see detailed logs</li>
          <li>Most sources will show "Download initiated" - check console for actual results</li>
          <li>CORS errors are expected for cross-origin requests</li>
          <li>403/401 errors are expected for paid sources without credentials</li>
          <li>404 errors may occur for weekly puzzles or incorrect URLs</li>
          <li>Check IndexedDB (Application tab) for successfully downloaded puzzles</li>
        </ul>
      </div>
    </div>
  )
}

export default BulkTestRunner

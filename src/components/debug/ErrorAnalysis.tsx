interface ErrorInfo {
  type: 'CORS' | 'AUTH' | 'NOT_FOUND' | 'RATE_LIMIT' | 'SERVER_ERROR' | 'UNKNOWN'
  severity: 'expected' | 'warning' | 'error'
  message: string
  solution: string
}

function categorizeError(errorMessage: string): ErrorInfo {
  const msg = errorMessage.toLowerCase()
  
  if (msg.includes('cors') || msg.includes('failed to fetch')) {
    return {
      type: 'CORS',
      severity: 'expected',
      message: 'CORS Policy Blocking Request',
      solution: 'Expected in browser. Use CORS proxy (VITE_CORS_PROXY_URL) or server-side download in production.'
    }
  }
  
  if (msg.includes('403') || msg.includes('401') || msg.includes('authentication')) {
    return {
      type: 'AUTH',
      severity: 'expected',
      message: 'Authentication Required',
      solution: 'This is a paid/premium source. Configure credentials in production.'
    }
  }
  
  if (msg.includes('404') || msg.includes('not found')) {
    return {
      type: 'NOT_FOUND',
      severity: 'warning',
      message: 'Puzzle Not Found',
      solution: 'Weekly puzzle tested on wrong day, or URL pattern incorrect, or not published yet.'
    }
  }
  
  if (msg.includes('429') || msg.includes('rate limit')) {
    return {
      type: 'RATE_LIMIT',
      severity: 'warning',
      message: 'Rate Limit Exceeded',
      solution: 'Too many requests. Wait before retrying.'
    }
  }
  
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) {
    return {
      type: 'SERVER_ERROR',
      severity: 'error',
      message: 'Server Error',
      solution: 'Source server is down or having issues. Try again later.'
    }
  }
  
  return {
    type: 'UNKNOWN',
    severity: 'error',
    message: 'Unknown Error',
    solution: 'Check console logs for details.'
  }
}

interface ErrorAnalysisProps {
  error: string
  sourceName: string
}

function ErrorAnalysis({ error, sourceName }: ErrorAnalysisProps) {
  const info = categorizeError(error)
  
  const severityColors = {
    expected: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
  }
  
  const icons = {
    expected: 'ℹ️',
    warning: '⚠️',
    error: '❌'
  }
  
  return (
    <div className={`p-3 border rounded text-xs ${severityColors[info.severity]}`}>
      <div className="flex items-start gap-2">
        <span className="text-base">{icons[info.severity]}</span>
        <div className="flex-1 space-y-1">
          <div className="font-semibold">{sourceName}: {info.message}</div>
          <div className="opacity-80">{info.solution}</div>
          {info.severity === 'expected' && (
            <div className="text-[10px] opacity-60 mt-1">
              ✓ This is normal behavior for browser-based testing
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorAnalysis
export { categorizeError }
export type { ErrorInfo }

type FetchInput = RequestInfo | URL

interface RetryOptions extends RequestInit {
  retries?: number
  retryDelayMs?: number
  retryOn?: number[]
  timeoutMs?: number
}

const DEFAULT_RETRY_STATUS = [408, 425, 429, 500, 502, 503, 504]

export async function fetchWithRetry(input: FetchInput, options: RetryOptions = {}) {
  const {
    retries = 2,
    retryDelayMs = 500,
    retryOn = DEFAULT_RETRY_STATUS,
    timeoutMs,
    signal,
    ...rest
  } = options
  const baseSignal = signal ?? undefined

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = timeoutMs ? new AbortController() : undefined
    const timer = timeoutMs ? setTimeout(() => controller?.abort(), timeoutMs) : undefined
    try {
      const response = await fetch(input, {
        ...rest,
        signal: controller ? mergeSignals(baseSignal, controller.signal) : baseSignal,
      })

      if (response.ok || !retryOn.includes(response.status) || attempt === retries) {
        return response
      }
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
    } finally {
      if (timer) clearTimeout(timer)
    }

    await delay(retryDelayMs * (attempt + 1))
  }

  throw new Error('fetchWithRetry exhausted all retries')
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mergeSignals(signal?: AbortSignal, timeoutSignal?: AbortSignal) {
  if (!signal) {
    return timeoutSignal
  }
  if (!timeoutSignal) {
    return signal
  }

  const controller = new AbortController()
  const abort = (reason?: unknown) => controller.abort(reason)
  signal.addEventListener('abort', () => abort(signal.reason), { once: true })
  timeoutSignal.addEventListener('abort', () => abort(timeoutSignal.reason), { once: true })
  return controller.signal
}

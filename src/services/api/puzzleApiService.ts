import type { PuzzleApiResult, PuzzleDownloadRequest, PuzzleDownloadResponse } from '@/types/api.types'
import type { PuzzleFormat } from '@/types/source.types'
import type { ParseResult } from '@/types/puzzle.types'

let parserFn: ((blob: Blob, format: PuzzleFormat) => Promise<ParseResult>) | null = null

export function registerPuzzleParser(fn: (blob: Blob, format: PuzzleFormat) => Promise<ParseResult>) {
  parserFn = fn
}

export async function downloadAndParsePuzzle(request: PuzzleDownloadRequest): Promise<PuzzleApiResult> {
  console.log(`[PuzzleApiService] Starting download for ${request.source.id}`)
  try {
    const response = await fetchPuzzleAsset(request)
    console.log(`[PuzzleApiService] Asset fetched successfully, format: ${response.format}`)
    
    if (!parserFn) {
      throw new Error('Puzzle parser pipeline has not been registered yet.')
    }

    console.log(`[PuzzleApiService] Parsing puzzle...`)
    const parsed = await parserFn(response.blob, response.format)
    console.log(`[PuzzleApiService] Parse result:`, { success: parsed.success, hasData: !!parsed.data, error: parsed.error })
    
    return {
      puzzle: parsed.data,
      response,
      error: parsed.success ? undefined : { sourceId: response.sourceId, message: parsed.error ?? 'Unknown parser error', retriable: false },
      warnings: parsed.warnings,
    }
  } catch (error) {
    console.error(`[PuzzleApiService] Download/parse error:`, error)
    return {
      error: {
        sourceId: request.source.id,
        message: error instanceof Error ? error.message : 'Unknown download error',
        retriable: true,
      },
    }
  }
}

export async function fetchPuzzleAsset({ source, date, signal }: PuzzleDownloadRequest): Promise<PuzzleDownloadResponse> {
  const endpoint = buildRequestUrl(source.download.url, date)
  console.log(`[PuzzleApiService] Fetching from: ${endpoint}`)
  
  try {
    const response = await fetch(endpoint, {
      method: source.download.method ?? 'GET',
      headers: source.download.headers,
      signal,
      mode: 'cors',
    })

    console.log(`[PuzzleApiService] Response status: ${response.status}`)

    if (!response.ok) {
      const errorType = categorizeHttpError(response.status)
      const errorMessage = formatHttpError(source.name, response.status, errorType)
      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    console.log(`[PuzzleApiService] Blob received, size: ${blob.size} bytes, type: ${blob.type}`)
    
    return {
      sourceId: source.id,
      format: source.download.format,
      blob,
      receivedAt: new Date().toISOString(),
      etag: response.headers.get('etag') ?? undefined,
    }
  } catch (error) {
    // Enhanced error handling for network issues
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        `CORS blocked: ${source.name} does not allow browser access. ` +
        `This is expected for most sources. Use a CORS proxy or server-side download in production.`
      )
    }
    throw error
  }
}

function buildRequestUrl(template: string, date?: string) {
  if (!template.includes('{{')) {
    return template
  }

  const targetDate = date ? new Date(date) : new Date()
  const tokens: Record<string, string> = {
    YYYY: targetDate.getUTCFullYear().toString(),
    MM: String(targetDate.getUTCMonth() + 1).padStart(2, '0'),
    DD: String(targetDate.getUTCDate()).padStart(2, '0'),
  }

  return template.replace(/{{(YYYY|MM|DD)}}/g, (_, token: keyof typeof tokens) => tokens[token])
}

function categorizeHttpError(status: number): string {
  if (status === 401 || status === 403) return 'AUTH_REQUIRED'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

function formatHttpError(sourceName: string, status: number, errorType: string): string {
  const messages: Record<string, string> = {
    AUTH_REQUIRED: `${sourceName} requires authentication (${status}). This is a paid/premium source.`,
    NOT_FOUND: `${sourceName} puzzle not found (404). May not be published yet or URL pattern incorrect.`,
    RATE_LIMITED: `${sourceName} rate limit exceeded (429). Try again later.`,
    SERVER_ERROR: `${sourceName} server error (${status}). Try again later.`,
    UNKNOWN: `${sourceName} returned error: ${status}`,
  }
  return messages[errorType] || messages.UNKNOWN
}

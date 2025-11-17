import { corsProxyUrl } from '@/config/runtimeConfig'
import type { PuzzleApiResult, PuzzleDownloadRequest, PuzzleDownloadResponse } from '@/types/api.types'
import type { PuzzleFormat, PuzzleSource } from '@/types/source.types'
import type { ParseResult } from '@/types/puzzle.types'

class PuzzleHttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

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
    const status = error instanceof PuzzleHttpError ? error.status : undefined
    const retriable = typeof status === 'number' ? status >= 500 || status === 429 : true
    return {
      error: {
        sourceId: request.source.id,
        status,
        message: error instanceof Error ? error.message : 'Unknown download error',
        retriable,
      },
    }
  }
}

// Fallback CORS proxies in order of preference (prioritizing binary file support)
const FALLBACK_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
]

export async function fetchPuzzleAsset({ source, date, signal }: PuzzleDownloadRequest): Promise<PuzzleDownloadResponse> {
  const endpoint = buildRequestUrl(source.download.url, date)

  // Try configured proxy first
  const { finalUrl, proxiedThrough } = applyCorsProxy(endpoint)
  console.log(`[PuzzleApiService] Fetching from: ${finalUrl}`)
  if (proxiedThrough) {
    console.log(`[PuzzleApiService] Request routed via CORS proxy: ${proxiedThrough}`)
  }

  try {
    const response = await fetchWithTimeout(finalUrl, {
      method: source.download.method ?? 'GET',
      headers: source.download.headers,
      signal,
      mode: 'cors',
    }, 10000) // 10 second timeout

    console.log(`[PuzzleApiService] Response status: ${response.status}`)

    if (!response.ok) {
      // If configured proxy fails with 403/500, try fallback proxies
      if ((response.status === 403 || response.status >= 500) && proxiedThrough) {
        console.warn(`[PuzzleApiService] Proxy failed with ${response.status}, trying fallbacks...`)
        return await fetchWithFallbackProxies(endpoint, source, signal)
      }

      const errorType = categorizeHttpError(response.status, source)
      const errorMessage = formatHttpError(source, response.status, errorType)
      throw new PuzzleHttpError(response.status, errorMessage)
    }

    const blob = await response.blob()
    console.log(`[PuzzleApiService] Blob received, size: ${blob.size} bytes, type: ${blob.type}`)

    // Validate binary file format (check for PUZ magic string if applicable)
    if (source.download.format === 'puz') {
      await validatePuzBlob(blob)
    }

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
      throw new PuzzleHttpError(
        0,
        `CORS blocked: ${source.name} does not allow browser access. ` +
        `This is expected for most sources. Use a CORS proxy or server-side download in production.`,
      )
    }
    throw error
  }
}

async function validatePuzBlob(blob: Blob): Promise<void> {
  // Read first 100 bytes to check for PUZ magic string
  const slice = blob.slice(0, 100)
  const buffer = await slice.arrayBuffer()
  const view = new Uint8Array(buffer)

  // Check for "ACROSS&DOWN" magic string at offset 0x2 (should be around bytes 2-13)
  const magicString = 'ACROSS&DOWN'
  let found = false

  // Search in first 50 bytes for the magic string
  for (let i = 0; i < Math.min(50, view.length - magicString.length); i++) {
    let match = true
    for (let j = 0; j < magicString.length; j++) {
      if (view[i + j] !== magicString.charCodeAt(j)) {
        match = false
        break
      }
    }
    if (match) {
      found = true
      console.log(`[PuzzleApiService] PUZ magic string found at offset ${i}`)
      break
    }
  }

  if (!found) {
    // Log the actual content to help debug
    const textDecoder = new TextDecoder()
    const preview = textDecoder.decode(view.slice(0, Math.min(100, view.length)))
    console.warn(`[PuzzleApiService] PUZ validation failed. First 100 bytes:`, preview)
    throw new Error('Received data is not a valid PUZ file (magic string not found). The CORS proxy may be corrupting binary data.')
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}

async function fetchWithFallbackProxies(
  endpoint: string,
  source: PuzzleSource,
  signal?: AbortSignal
): Promise<PuzzleDownloadResponse> {
  for (const proxy of FALLBACK_PROXIES) {
    try {
      const proxyUrl = proxy.endsWith('=')
        ? `${proxy}${encodeURIComponent(endpoint)}`
        : `${proxy}${endpoint}`

      console.log(`[PuzzleApiService] Trying fallback proxy: ${proxy}`)

      const response = await fetchWithTimeout(proxyUrl, {
        method: source.download.method ?? 'GET',
        headers: source.download.headers,
        signal,
        mode: 'cors',
      }, 10000)

      if (response.ok) {
        console.log(`[PuzzleApiService] Success with fallback proxy: ${proxy}`)
        const blob = await response.blob()

        // Validate binary format before returning
        if (source.download.format === 'puz') {
          try {
            await validatePuzBlob(blob)
          } catch {
            console.warn(`[PuzzleApiService] Fallback proxy ${proxy} returned invalid PUZ file`)
            continue // Try next proxy
          }
        }

        return {
          sourceId: source.id,
          format: source.download.format,
          blob,
          receivedAt: new Date().toISOString(),
          etag: response.headers.get('etag') ?? undefined,
        }
      }

      console.warn(`[PuzzleApiService] Fallback proxy ${proxy} returned ${response.status}`)
    } catch (error) {
      console.warn(`[PuzzleApiService] Fallback proxy ${proxy} failed:`, error)
      continue
    }
  }

  throw new PuzzleHttpError(
    503,
    `${source.name}: All CORS proxies failed. The puzzle source may be down or blocking proxy requests.`
  )
}

function buildRequestUrl(template: string, date?: string) {
  if (!template.includes('{{')) {
    return template
  }

  const targetDate = date ? new Date(date) : new Date()
  const tokens: Record<string, string> = {
    YYYY: targetDate.getUTCFullYear().toString(),
    YY: targetDate.getUTCFullYear().toString().slice(-2),
    MM: String(targetDate.getUTCMonth() + 1).padStart(2, '0'),
    DD: String(targetDate.getUTCDate()).padStart(2, '0'),
  }

  return template.replace(/{{(YYYY|YY|MM|DD)}}/g, (_, token: keyof typeof tokens) => tokens[token])
}

function applyCorsProxy(url: string) {
  if (!corsProxyUrl) {
    return { finalUrl: url, proxiedThrough: '' }
  }

  const trimmed = corsProxyUrl.trim()
  if (!trimmed) {
    return { finalUrl: url, proxiedThrough: '' }
  }

  // Support placeholder replacement e.g. https://proxy.com/?target={url}
  if (trimmed.includes('{url}')) {
    const finalUrl = trimmed.replace('{url}', encodeURIComponent(url))
    return { finalUrl, proxiedThrough: trimmed }
  }

  // Support trailing query indicator for proxies like corsproxy.io/?
  if (trimmed.endsWith('?')) {
    return { finalUrl: `${trimmed}${url}`, proxiedThrough: trimmed }
  }

  if (trimmed.endsWith('=')) {
    return { finalUrl: `${trimmed}${encodeURIComponent(url)}`, proxiedThrough: trimmed }
  }

  const finalUrl = `${trimmed}${url}`
  return { finalUrl, proxiedThrough: trimmed }
}

type HttpErrorType = 'AUTH_REQUIRED' | 'ACCESS_BLOCKED' | 'NOT_FOUND' | 'RATE_LIMITED' | 'SERVER_ERROR' | 'UNKNOWN'

function categorizeHttpError(status: number, source: PuzzleSource): HttpErrorType {
  if ((status === 401 || status === 403) && source.requiresAuth) return 'AUTH_REQUIRED'
  if (status === 401 || status === 403) return 'ACCESS_BLOCKED'
  if (status === 404) return 'NOT_FOUND'
  if (status === 429) return 'RATE_LIMITED'
  if (status >= 500) return 'SERVER_ERROR'
  return 'UNKNOWN'
}

function formatHttpError(source: PuzzleSource, status: number, errorType: HttpErrorType): string {
  const { name, category } = source
  const messages: Record<HttpErrorType, string> = {
    AUTH_REQUIRED: `${name} requires authentication (${status}). Provide valid credentials for this premium source.`,
    ACCESS_BLOCKED: `${name} blocked the request (${status}). This source is marked as ${category}, but the publisher may require referer headers, geo access, or an alternative download endpoint.`,
    NOT_FOUND: `${name} puzzle not found (404). May not be published yet or the URL pattern is incorrect.`,
    RATE_LIMITED: `${name} rate limit exceeded (429). Try again later.`,
    SERVER_ERROR: `${name} server error (${status}). Try again later.`,
    UNKNOWN: `${name} returned error: ${status}`,
  }
  return messages[errorType]
}

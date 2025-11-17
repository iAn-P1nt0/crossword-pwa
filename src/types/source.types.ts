export type PuzzleFormat = 'puz' | 'ipuz' | 'jpz' | 'xd' | 'json' | 'rss' | 'pdf'
export type SourceCategory = 'free' | 'paid'
export type SourceFrequency = 'daily' | 'weekly' | 'monthly' | 'adhoc'
export type AuthType = 'none' | 'api_key' | 'oauth' | 'cookie'

export interface SourceCredentialConfig {
  apiKey?: string
  username?: string
  password?: string
  token?: string
  cookie?: string
}

export interface DownloadEndpoint {
  url: string
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  query?: Record<string, string>
  bodyTemplate?: Record<string, unknown>
  format: PuzzleFormat
}

export interface PuzzleSourceBase {
  id: string
  name: string
  description?: string
  homepage?: string
  timezone?: string
  frequency: SourceFrequency
  category: SourceCategory
  format: PuzzleFormat
  requiresAuth: boolean
  authType: AuthType
  priority: number
  defaultEnabled: boolean
  download: DownloadEndpoint
}

export interface FreePuzzleSource extends PuzzleSourceBase {
  category: 'free'
  requiresAuth: false
  authType: 'none'
}

export interface PaidPuzzleSource extends PuzzleSourceBase {
  category: 'paid'
  requiresAuth: true
  credentialHints?: string[]
}

export type PuzzleSource = FreePuzzleSource | PaidPuzzleSource

export interface SourceStatus {
  sourceId: string
  lastSyncedAt?: string
  lastSuccessAt?: string
  lastError?: string
  enabled: boolean
  failuresInRow: number
}

import { create } from 'zustand'
import { FREE_SOURCES, PAID_SOURCES } from '@/services/api/sourceRegistry'
import { getAllSourceConfigs, upsertSourceConfig } from '@/services/storage/sourceStorage'
import type { SourceCredentialConfig, SourceStatus, PuzzleSource } from '@/types/source.types'

interface SourcesStoreState {
  sources: PuzzleSource[]
  status: Record<string, SourceStatus>
  credentials: Record<string, SourceCredentialConfig>
  initialized: boolean
  initialize: () => Promise<void>
  toggleSource: (sourceId: string, enabled?: boolean) => Promise<void>
  updateCredentials: (sourceId: string, credentials: SourceCredentialConfig) => Promise<void>
  recordSyncResult: (sourceId: string, success: boolean, error?: string) => Promise<void>
}

const ALL_SOURCES = [...FREE_SOURCES, ...PAID_SOURCES]
const defaultStatus = Object.fromEntries(
  ALL_SOURCES.map((source) => [source.id, createDefaultStatus(source)]),
)

const useSourcesStore = create<SourcesStoreState>((set, get) => ({
  sources: ALL_SOURCES,
  status: { ...defaultStatus },
  credentials: {},
  initialized: false,
  initialize: async () => {
    const configs = await getAllSourceConfigs()
    set((state) => {
      const status = { ...state.status }
      const credentials = { ...state.credentials }
      for (const config of configs) {
        status[config.id] = {
          sourceId: config.id,
          enabled: config.enabled,
          failuresInRow: config.error ? 1 : 0,
          lastSyncedAt: config.lastSyncedAt,
          lastSuccessAt: config.lastDownloadedAt,
          lastError: config.error,
        }
        if (config.credentials) {
          credentials[config.id] = config.credentials
        }
      }
      return { status, credentials, initialized: true }
    })
  },
  toggleSource: async (sourceId, enabled) => {
    const { status, credentials, sources } = get()
    const current = status[sourceId] ?? createDefaultStatus(findSource(sourceId, sources))
    const nextStatus: SourceStatus = { ...current, enabled: enabled ?? !current.enabled }
    set((state) => ({
      status: {
        ...state.status,
        [sourceId]: nextStatus,
      },
    }))
    await persistSourceConfig(findSource(sourceId, sources), nextStatus, credentials[sourceId])
  },
  updateCredentials: async (sourceId, creds) => {
    const { status, sources } = get()
    set((state) => ({
      credentials: {
        ...state.credentials,
        [sourceId]: creds,
      },
    }))
    await persistSourceConfig(findSource(sourceId, sources), status[sourceId], creds)
  },
  recordSyncResult: async (sourceId, success, error) => {
    const { status, credentials, sources } = get()
    const current = status[sourceId] ?? createDefaultStatus(findSource(sourceId, sources))
    const next: SourceStatus = success
      ? {
          ...current,
          lastSyncedAt: new Date().toISOString(),
          lastSuccessAt: new Date().toISOString(),
          lastError: undefined,
          failuresInRow: 0,
        }
      : {
          ...current,
          lastSyncedAt: new Date().toISOString(),
          lastError: error ?? 'Unknown sync error',
          failuresInRow: current.failuresInRow + 1,
        }

    set((state) => ({
      status: {
        ...state.status,
        [sourceId]: next,
      },
    }))
    await persistSourceConfig(findSource(sourceId, sources), next, credentials[sourceId])
  },
}))

function createDefaultStatus(source: PuzzleSource): SourceStatus {
  return {
    sourceId: source.id,
    enabled: source.defaultEnabled,
    failuresInRow: 0,
  }
}

function findSource(id: string, sources: PuzzleSource[]) {
  const source = sources.find((item) => item.id === id)
  if (!source) {
    throw new Error(`Unknown source: ${id}`)
  }
  return source
}

async function persistSourceConfig(
  source: PuzzleSource,
  status: SourceStatus,
  credentials?: SourceCredentialConfig,
) {
  await upsertSourceConfig({
    id: source.id,
    source,
    enabled: status.enabled,
    credentials,
    lastSyncedAt: status.lastSyncedAt,
    lastDownloadedAt: status.lastSuccessAt,
    error: status.lastError,
  })
}

export default useSourcesStore

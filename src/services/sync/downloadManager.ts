import { db, type DownloadQueueRecord } from '@/services/storage/db'
import { downloadAndParsePuzzle } from '@/services/api/puzzleApiService'
import { upsertPuzzle } from '@/services/storage/puzzleStorage'
import useSourcesStore from '@/stores/useSourcesStore'
import type { PuzzleSource } from '@/types/source.types'
import type { PuzzleData } from '@/types/puzzle.types'

type DownloadListener = (event: DownloadEvent) => void

interface DownloadTask {
  id: string
  source: PuzzleSource
  date?: string
  resolve: (data: DownloadEvent) => void
  reject: (error: unknown) => void
}

export type DownloadEvent =
  | { type: 'queued'; taskId: string; sourceId: string }
  | { type: 'started'; taskId: string; sourceId: string }
  | { type: 'completed'; taskId: string; sourceId: string; puzzle: PuzzleData }
  | { type: 'failed'; taskId: string; sourceId: string; error: string }

const MAX_CONCURRENCY = 2
const queue: DownloadTask[] = []
const listeners = new Set<DownloadListener>()
let activeTasks = 0

export function subscribeDownloads(listener: DownloadListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function enqueueDownload(source: PuzzleSource, date?: string) {
  return new Promise<DownloadEvent>((resolve, reject) => {
    const task: DownloadTask = {
      id: createTaskId(source.id),
      source,
      date,
      resolve,
      reject,
    }
    queue.push(task)
    notify({ type: 'queued', taskId: task.id, sourceId: source.id })
    void persistQueueRecord(task, 'pending')
    void processQueue()
  })
}

async function processQueue(): Promise<void> {
  if (activeTasks >= MAX_CONCURRENCY) return
  const task = queue.shift()
  if (!task) return
  activeTasks += 1
  notify({ type: 'started', taskId: task.id, sourceId: task.source.id })
  await persistQueueRecord(task, 'in-progress')
  try {
    const result = await downloadAndParsePuzzle({ source: task.source, date: task.date })
    if (result.puzzle) {
      await upsertPuzzle(result.puzzle)
      notify({ type: 'completed', taskId: task.id, sourceId: task.source.id, puzzle: result.puzzle })
      await persistQueueRecord(task, 'complete')
      dispatchPuzzleEvent(result.puzzle)
      await useSourcesStore.getState().recordSyncResult(task.source.id, true)
      task.resolve({ type: 'completed', taskId: task.id, sourceId: task.source.id, puzzle: result.puzzle })
    } else {
      const message = result.error?.message ?? 'Unknown parser error'
      notify({ type: 'failed', taskId: task.id, sourceId: task.source.id, error: message })
      await persistQueueRecord(task, 'error', message)
      await useSourcesStore.getState().recordSyncResult(task.source.id, false, message)
      task.resolve({ type: 'failed', taskId: task.id, sourceId: task.source.id, error: message })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Download failed'
    notify({ type: 'failed', taskId: task.id, sourceId: task.source.id, error: message })
    await persistQueueRecord(task, 'error', message)
    await useSourcesStore.getState().recordSyncResult(task.source.id, false, message)
    task.reject(error)
  } finally {
    activeTasks -= 1
    void processQueue()
  }
}

function notify(event: DownloadEvent) {
  listeners.forEach((listener) => listener(event))
}

async function persistQueueRecord(task: DownloadTask, status: DownloadQueueRecord['status'], error?: string) {
  await db.downloads.put({
    sourceId: task.source.id,
    requestedDate: new Date().toISOString(),
    status,
    priority: task.source.priority,
    retries: status === 'error' ? 1 : 0,
    error,
  })
}

function dispatchPuzzleEvent(puzzle: PuzzleData) {
  if (typeof window === 'undefined') return
  const event = new CustomEvent<PuzzleData>('puzzle:downloaded', { detail: puzzle })
  window.dispatchEvent(event)
}

function createTaskId(sourceId: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${sourceId}-${crypto.randomUUID()}`
  }
  return `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

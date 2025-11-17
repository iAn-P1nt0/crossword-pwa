import { convertIpuzToUnified, parseIpuz as parseIpuzJson } from '@xwordly/xword-parser'
import type { ParseResult } from '@/types/puzzle.types'
import { convertUnifiedPuzzle } from './unifiedConverter'
import { parserError } from './parserUtils'

export async function parseIpuz(blob: Blob): Promise<ParseResult> {
  try {
    const content = await blob.text()
    const puzzle = parseIpuzJson(content)
    const unified = convertIpuzToUnified(puzzle)
    const data = convertUnifiedPuzzle(unified, 'ipuz')
    return { success: true, data }
  } catch (error) {
    return parserError('iPUZ', error)
  }
}

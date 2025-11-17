import { convertPuzToUnified, parsePuz as parsePuzBinary } from '@xwordly/xword-parser'
import type { ParseResult } from '@/types/puzzle.types'
import { convertUnifiedPuzzle } from './unifiedConverter'
import { parserError } from './parserUtils'

export async function parsePuz(blob: Blob): Promise<ParseResult> {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const puzzle = parsePuzBinary(arrayBuffer)
    const unified = convertPuzToUnified(puzzle)
    const data = convertUnifiedPuzzle(unified, 'puz')
    return { success: true, data }
  } catch (error) {
    return parserError('PUZ', error)
  }
}

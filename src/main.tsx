import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerPuzzleParser } from '@/services/api/puzzleApiService'
import { parsePuzzleBlob } from '@/parsers'
import './index.css'
import App from './App.tsx'

registerPuzzleParser(parsePuzzleBlob)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

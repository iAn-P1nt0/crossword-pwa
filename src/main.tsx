import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerPuzzleParser } from '@/services/api/puzzleApiService'
import { parsePuzzleBlob } from '@/parsers'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker, requestBackgroundSync } from '@/services/worker/serviceWorker'

registerPuzzleParser(parsePuzzleBlob)

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  void registerServiceWorker().then(() => {
    void requestBackgroundSync()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

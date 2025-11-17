import { useEffect } from 'react'
import useSettingsStore from '@/stores/useSettingsStore'

export function useOfflineSync() {
  const setOnlineStatus = useSettingsStore((state) => state.setOnlineStatus)

  useEffect(() => {
    const updateStatus = () => {
      setOnlineStatus(typeof navigator === 'undefined' ? true : navigator.onLine)
    }

    updateStatus()
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [setOnlineStatus])
}

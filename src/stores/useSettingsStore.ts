import { create } from 'zustand'
import { getSetting, setSetting } from '@/services/storage/settingsStorage'

const SETTINGS_KEY = 'app-settings'

interface SettingsSnapshot {
  theme: 'system' | 'light' | 'dark'
  autoCheck: boolean
  hapticsEnabled: boolean
  offlineMode: boolean
}

interface SettingsStoreState extends SettingsSnapshot {
  isOnline: boolean
  hydrate: () => Promise<void>
  setTheme: (theme: SettingsSnapshot['theme']) => Promise<void>
  toggleAutoCheck: () => Promise<void>
  toggleHaptics: () => Promise<void>
  setOfflineMode: (enabled: boolean) => Promise<void>
  setOnlineStatus: (online: boolean) => void
}

const defaultSnapshot: SettingsSnapshot = {
  theme: 'system',
  autoCheck: false,
  hapticsEnabled: true,
  offlineMode: false,
}

const useSettingsStore = create<SettingsStoreState>((set, get) => ({
  ...defaultSnapshot,
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  hydrate: async () => {
    const persisted = await getSetting<SettingsSnapshot>(SETTINGS_KEY)
    if (persisted) {
      set((state) => ({ ...state, ...persisted }))
    }
  },
  setTheme: async (theme) => {
    set({ theme })
    await persistSettings(get())
  },
  toggleAutoCheck: async () => {
    set((state) => ({ autoCheck: !state.autoCheck }))
    await persistSettings(get())
  },
  toggleHaptics: async () => {
    set((state) => ({ hapticsEnabled: !state.hapticsEnabled }))
    await persistSettings(get())
  },
  setOfflineMode: async (enabled) => {
    set({ offlineMode: enabled })
    await persistSettings(get())
  },
  setOnlineStatus: (online) => {
    set({ isOnline: online })
  },
}))

async function persistSettings(state: SettingsStoreState) {
  const snapshot: SettingsSnapshot = {
    theme: state.theme,
    autoCheck: state.autoCheck,
    hapticsEnabled: state.hapticsEnabled,
    offlineMode: state.offlineMode,
  }
  await setSetting(SETTINGS_KEY, snapshot)
}

export default useSettingsStore

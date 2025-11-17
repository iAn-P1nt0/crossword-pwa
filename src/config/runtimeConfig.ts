export const remoteSyncEnabled =
  typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined'
    ? import.meta.env.VITE_ENABLE_REMOTE_SOURCES === 'true'
    : false

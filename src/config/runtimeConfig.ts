const remoteSyncEnabled =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env !== 'undefined' &&
  import.meta.env.VITE_ENABLE_REMOTE_SOURCES === 'true'

const corsProxyUrl =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env !== 'undefined' &&
  typeof import.meta.env.VITE_CORS_PROXY_URL === 'string'
    ? import.meta.env.VITE_CORS_PROXY_URL
    : ''

export { remoteSyncEnabled, corsProxyUrl }

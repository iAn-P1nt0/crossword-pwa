/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_REMOTE_SOURCES?: string
  readonly VITE_CORS_PROXY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

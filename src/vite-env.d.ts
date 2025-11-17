/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_ENABLE_REMOTE_SOURCES?: string
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv
}

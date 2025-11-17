const SW_URL = '/sw.js'
let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(null)
  }
  if (!registrationPromise) {
    registrationPromise = navigator.serviceWorker
      .register(SW_URL)
      .then((registration) => {
        return registration
      })
      .catch(() => null)
  }
  return registrationPromise
}

export async function requestBackgroundSync(tag = 'puzzle-sync') {
  const registration = await registerServiceWorker()
  if (!registration || !('sync' in registration)) return
  const syncCapable = registration as ServiceWorkerRegistration & { sync: SyncManager }
  try {
    await syncCapable.sync.register(tag)
  } catch (error) {
    console.warn('Background sync unavailable', error)
  }
}

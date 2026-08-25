const SUBSCRIPTION_TAG = 'morning_love_notes'
const DEFAULT_APP_ID = 'a8eaa49d-51c4-426f-8bcb-63bd36f32b5a'

let initialization

function appId() {
  return import.meta.env.VITE_ONESIGNAL_APP_ID || DEFAULT_APP_ID
}

function serviceWorkerPath() {
  return `${import.meta.env.BASE_URL.replace(/^\//, '')}push/onesignal/OneSignalSDKWorker.js`
}

export function notificationSupport() {
  if (typeof window === 'undefined') return { configured: false, supported: false }

  return {
    configured: Boolean(appId()),
    supported:
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window,
  }
}

function loadOneSignal() {
  window.OneSignalDeferred = window.OneSignalDeferred || []

  return new Promise((resolve) => {
    window.OneSignalDeferred.push((OneSignal) => resolve(OneSignal))
  })
}

export function initializeNotifications() {
  if (initialization) return initialization

  const oneSignalAppId = appId()

  initialization = loadOneSignal().then(async (OneSignal) => {
    await OneSignal.init({
      appId: oneSignalAppId,
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      serviceWorkerPath: serviceWorkerPath(),
      serviceWorkerParam: { scope: `${import.meta.env.BASE_URL}push/onesignal/` },
      welcomeNotification: { disable: true },
    })
    return OneSignal
  })

  return initialization
}

export async function notificationStatus() {
  const OneSignal = await initializeNotifications()
  return {
    permission: Notification.permission,
    subscribed: Boolean(OneSignal.User.PushSubscription.optedIn),
  }
}

export async function enableMorningNotes() {
  const OneSignal = await initializeNotifications()
  const granted = await OneSignal.Notifications.requestPermission()

  if (!granted && Notification.permission !== 'granted') {
    return { permission: Notification.permission, subscribed: false }
  }

  await OneSignal.User.PushSubscription.optIn()
  await OneSignal.User.addTag(SUBSCRIPTION_TAG, 'enabled')
  return notificationStatus()
}

export async function disableMorningNotes() {
  const OneSignal = await initializeNotifications()
  await OneSignal.User.removeTag(SUBSCRIPTION_TAG)
  await OneSignal.User.PushSubscription.optOut()
  return notificationStatus()
}

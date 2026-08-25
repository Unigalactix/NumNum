import { loveNoteForDay, loveNotes } from '../src/loveNotes.js'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_APP_ID = 'a8eaa49d-51c4-426f-8bcb-63bd36f32b5a'
const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true'
const appId = process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID
const apiKey = process.env.ONESIGNAL_REST_API_KEY
const siteUrl = process.env.NUMNUM_SITE_URL || 'https://unigalactix.github.io/NumNum/'
const dayNumber = Math.floor(Date.now() / DAY_MS)
const note = loveNoteForDay(dayNumber)

if (loveNotes.length !== 1000 || new Set(loveNotes).size !== 1000) {
  throw new Error('The morning love-note collection must contain exactly 1,000 unique messages.')
}

if (Math.max(...loveNotes.map((message) => message.length)) > 120) {
  throw new Error('Morning love notes must stay at or below 120 characters.')
}

const notification = {
  app_id: appId,
  contents: { en: note.body },
  delivery_time_of_day: '9:00AM',
  delayed_option: 'timezone',
  filters: [
    { field: 'tag', key: 'morning_love_notes', relation: '=', value: 'enabled' },
  ],
  headings: { en: note.title },
  target_channel: 'push',
  url: siteUrl,
}

if (dryRun) {
  console.log(JSON.stringify({ index: note.index, notification }, null, 2))
  process.exit(0)
}

if (!appId || !apiKey) {
  throw new Error('ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY are required to send notifications.')
}

const response = await fetch('https://api.onesignal.com/notifications', {
  method: 'POST',
  headers: {
    Authorization: `Key ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(notification),
})

const result = await response.json()
if (!response.ok || result.errors) {
  throw new Error(`OneSignal rejected the notification: ${JSON.stringify(result)}`)
}

if (!result.id) {
  throw new Error('OneSignal found no eligible morning-love-note subscribers.')
}

console.log(`Scheduled love note ${note.index + 1} for subscribers' local 9:00 AM.`)
console.log(`OneSignal notification ID: ${result.id}`)

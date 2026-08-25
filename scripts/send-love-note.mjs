import { createHash } from 'node:crypto'
import {
  afternoonNoteForDay,
  afternoonNotes,
  loveNoteForDay,
  loveNotes,
} from '../src/loveNotes.js'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_APP_ID = 'a8eaa49d-51c4-426f-8bcb-63bd36f32b5a'
const AFTERNOON_TIMES = [
  '3:00PM',
  '3:15PM',
  '3:30PM',
  '3:45PM',
  '4:00PM',
  '4:15PM',
  '4:30PM',
  '4:45PM',
  '5:00PM',
  '5:15PM',
  '5:30PM',
]
const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true'
const periodArgument = process.argv.find((argument) => argument.startsWith('--period='))
const period = process.env.NOTE_PERIOD || periodArgument?.split('=')[1] || 'morning'
const appId = process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID
const apiKey = process.env.ONESIGNAL_REST_API_KEY
const siteUrl = process.env.NUMNUM_SITE_URL || 'https://unigalactix.github.io/NumNum/'
const dayNumber = Math.floor(Date.now() / DAY_MS)
const isAfternoon = period === 'afternoon'

if (!['morning', 'afternoon'].includes(period)) {
  throw new Error(`Unknown love-note period: ${period}`)
}

const messages = isAfternoon ? afternoonNotes : loveNotes
const note = isAfternoon ? afternoonNoteForDay(dayNumber) : loveNoteForDay(dayNumber)
const deliveryTime = isAfternoon
  ? AFTERNOON_TIMES[Math.abs(dayNumber * 13 + 5) % AFTERNOON_TIMES.length]
  : '9:00AM'
const idempotencyHex = createHash('sha256')
  .update(`numnum-${period}-${dayNumber}`)
  .digest('hex')
  .slice(0, 32)
const idempotencyKey = `${idempotencyHex.slice(0, 8)}-${idempotencyHex.slice(8, 12)}-4${idempotencyHex.slice(13, 16)}-a${idempotencyHex.slice(17, 20)}-${idempotencyHex.slice(20)}`

if (messages.length !== 1000 || new Set(messages).size !== 1000) {
  throw new Error(`The ${period} love-note collection must contain exactly 1,000 unique messages.`)
}

if (Math.max(...messages.map((message) => message.length)) > 120) {
  throw new Error(`${period} love notes must stay at or below 120 characters.`)
}

const notification = {
  app_id: appId,
  contents: { en: note.body },
  delivery_time_of_day: deliveryTime,
  delayed_option: 'timezone',
  filters: [
    { field: 'tag', key: 'morning_love_notes', relation: '=', value: 'enabled' },
  ],
  headings: { en: note.title },
  idempotency_key: idempotencyKey,
  name: `NumNum ${period} love note ${dayNumber}`,
  target_channel: 'push',
  url: siteUrl,
}

if (dryRun) {
  console.log(JSON.stringify({ deliveryTime, index: note.index, period, notification }, null, 2))
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
  throw new Error(`OneSignal found no eligible ${period} love-note subscribers.`)
}

console.log(`Scheduled ${period} love note ${note.index + 1} for subscribers' local ${deliveryTime}.`)
console.log(`OneSignal notification ID: ${result.id}`)

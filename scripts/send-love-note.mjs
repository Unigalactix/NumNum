import { createHash } from 'node:crypto'
import { stickerCollection } from '../src/content.js'
import { loveNoteForSlot, validateNoteCollections } from '../src/loveNotes.js'

const DAY_MS = 24 * 60 * 60 * 1000
const DEFAULT_APP_ID = 'a8eaa49d-51c4-426f-8bcb-63bd36f32b5a'
const MAX_SEND_ATTEMPTS = 3
const RETRYABLE_STATUS_CODES = new Set([408, 425, 429])
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
const dayArgument = process.argv.find((argument) => argument.startsWith('--day='))
const period = process.env.NOTE_PERIOD || periodArgument?.split('=')[1] || 'morning'
const appId = process.env.ONESIGNAL_APP_ID || DEFAULT_APP_ID
const apiKey = process.env.ONESIGNAL_REST_API_KEY
const siteUrl = process.env.NUMNUM_SITE_URL || 'https://unigalactix.github.io/NumNum/'
const notificationAssetUrl = (fileName) => new URL(`assets/notifications/${fileName}`, siteUrl).href
const dayNumber = Number(process.env.NOTE_DAY || dayArgument?.split('=')[1] || Math.floor(Date.now() / DAY_MS))
const isAfternoon = period === 'afternoon'
const isNight = period === 'night'

if (!Number.isInteger(dayNumber) || dayNumber < 0) {
  throw new Error(`Invalid day number: ${dayNumber}`)
}

if (!['morning', 'afternoon', 'night'].includes(period)) {
  throw new Error(`Unknown love-note period: ${period}`)
}

validateNoteCollections()
const note = loveNoteForSlot(dayNumber, period)
const nightMinute = Math.abs(dayNumber * 137 + 53) % (6 * 60)
const nightHour = 18 + Math.floor(nightMinute / 60)
const deliveryTime = isNight
  ? `${String(nightHour).padStart(2, '0')}:${String(nightMinute % 60).padStart(2, '0')}`
  : isAfternoon
    ? AFTERNOON_TIMES[Math.abs(dayNumber * 13 + 5) % AFTERNOON_TIMES.length]
    : '9:00AM'
const idempotencyHex = createHash('sha256')
  .update(`numnum-${period}-${dayNumber}`)
  .digest('hex')
  .slice(0, 32)
const idempotencyKey = `${idempotencyHex.slice(0, 8)}-${idempotencyHex.slice(8, 12)}-4${idempotencyHex.slice(13, 16)}-a${idempotencyHex.slice(17, 20)}-${idempotencyHex.slice(20)}`
const visualStyle = isNight ? 'text' : note.isTinglish ? 'tinglish' : period
const showRichImage = !isNight && (note.isTinglish || Math.abs(dayNumber * 7 + (isAfternoon ? 1 : 0)) % 4 === 0)
const sticker = isNight
  ? null
  : stickerCollection[Math.abs(dayNumber * 31 + (isAfternoon ? 17 : 3)) % stickerCollection.length]
const richImageUrl = sticker ? new URL(sticker.notificationFile, siteUrl).href : null
const iconUrl = notificationAssetUrl('notification-icon.png')

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function createNotification(payload) {
  for (let attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt += 1) {
    let response

    try {
      response = await fetch('https://api.onesignal.com/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      if (attempt === MAX_SEND_ATTEMPTS) throw error
      await wait(1000 * 2 ** (attempt - 1))
      continue
    }

    const result = await response.json().catch(() => ({}))
    if (response.ok && !result.errors) return result

    const retryable = RETRYABLE_STATUS_CODES.has(response.status) || response.status >= 500
    if (!retryable || attempt === MAX_SEND_ATTEMPTS) {
      throw new Error(`OneSignal rejected the notification: ${JSON.stringify(result)}`)
    }

    const retryAfter = Number(response.headers.get('retry-after'))
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 1000 * 2 ** (attempt - 1)
    await wait(delay)
  }

  throw new Error('OneSignal notification retries were exhausted.')
}

const notification = {
  app_id: appId,
  ...(!isNight ? { chrome_web_badge: notificationAssetUrl('notification-badge.png') } : {}),
  ...(!isNight ? { chrome_web_icon: iconUrl } : {}),
  ...(showRichImage ? { chrome_web_image: richImageUrl } : {}),
  contents: { en: note.body },
  data: {
    note_language: note.isTinglish ? 'tinglish' : 'english',
    note_period: period,
    note_style: visualStyle,
    note_id: note.id,
    note_theme: note.theme,
    note_sender: note.sender,
    ...(sticker ? { sticker_id: sticker.id } : {}),
  },
  delivery_time_of_day: deliveryTime,
  delayed_option: 'timezone',
  filters: [
    { field: 'tag', key: 'morning_love_notes', relation: '=', value: 'enabled' },
  ],
  ...(!isNight ? { firefox_icon: iconUrl } : {}),
  headings: { en: note.title },
  idempotency_key: idempotencyKey,
  name: `NumNum ${period} love note ${dayNumber}`,
  target_channel: 'push',
  url: siteUrl,
  ...(!isNight
    ? {
        web_buttons: [
          {
            id: 'open-numnum',
            icon: iconUrl,
            text: 'Open NumNum',
            url: siteUrl,
          },
        ],
      }
    : {}),
}

if (dryRun) {
  console.log(JSON.stringify({ deliveryTime, index: note.index, language: note.isTinglish ? 'tinglish' : 'english', period, showRichImage, sticker: sticker?.id || null, visualStyle, notification }, null, 2))
  process.exit(0)
}

if (!appId || !apiKey) {
  throw new Error('ONESIGNAL_APP_ID and ONESIGNAL_REST_API_KEY are required to send notifications.')
}

const result = await createNotification(notification)

if (!result.id) {
  throw new Error(`OneSignal found no eligible ${period} love-note subscribers.`)
}

console.log(`Scheduled ${period} love note ${note.index + 1} for subscribers' local ${deliveryTime}.`)
console.log(`OneSignal notification ID: ${result.id}`)

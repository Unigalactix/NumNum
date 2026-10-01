import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loveNoteForSlot, NOTE_PERIODS } from '../src/loveNotes.js'

function preview(day, period) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./send-love-note.mjs', import.meta.url)), '--dry-run'], {
    encoding: 'utf8',
    env: { ...process.env, DRY_RUN: 'true', NOTE_DAY: String(day), NOTE_PERIOD: period },
  })
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

test('all three payloads retain timezone delivery, metadata, emoji and stable idempotency', () => {
  const keys = new Set()
  for (const period of NOTE_PERIODS) {
    const first = preview(20727, period)
    const second = preview(20727, period)
    assert.deepEqual(first, second)
    const { notification } = first
    assert.equal(notification.contents.en, loveNoteForSlot(20727, period).body)
    assert.match(notification.contents.en, /\p{Extended_Pictographic}/u)
    assert.match(notification.headings.en, /\p{Extended_Pictographic}/u)
    assert.equal(notification.delayed_option, 'timezone')
    assert.equal(notification.data.note_theme, loveNoteForSlot(20727, period).theme)
    keys.add(notification.idempotency_key)
    if (period === 'morning') assert.equal(first.deliveryTime, '9:00AM')
    if (period === 'night') {
      assert.match(first.deliveryTime, /^(18|19|2[0-3]):[0-5][0-9]$/)
      assert.equal(first.showRichImage, false)
      assert.equal(notification.chrome_web_image, undefined)
      assert.equal(notification.web_buttons, undefined)
    }
  }
  assert.equal(keys.size, 3)
})

test('Goldie deliveries identify the puppy in the actual push payload, including at night', () => {
  const day = Array.from({ length: 100 }, (_, index) => 20727 + index)
    .find((day) => loveNoteForSlot(day, 'night').theme === 'goldie')
  assert.ok(day)
  const { notification } = preview(day, 'night')
  assert.equal(notification.data.note_sender, 'goldie')
  assert.match(notification.headings.en, /Goldie/)
})

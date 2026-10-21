import assert from 'node:assert/strict'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { content, stickerCollection, stickerPages } from '../src/content.js'

const assetExists = (file) => existsSync(new URL(`../public/${file}`, import.meta.url))

test('October memories stay chronological and include both festival photos', () => {
  const october = content.history.filter((moment) => moment.date.startsWith('October'))
  assert.deepEqual(october.map((moment) => moment.date), [
    'October 1st, 2026',
    'October 3rd, 2026',
    'October 5th, 2026',
    'October 17th, 2026',
  ])
  assert.equal(october[3].images.length, 2)
  for (const moment of content.history) {
    for (const photo of moment.images || (moment.image ? [moment] : [])) {
      assert.ok(assetExists(photo.image), `Missing history photo: ${photo.image}`)
      assert.ok(photo.imageAlt)
    }
  }
})

test('every source photo has an individual sticker and notification card', () => {
  const sources = readdirSync(fileURLToPath(new URL('../public/assets/', import.meta.url)))
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
  const photoStickers = stickerCollection.filter((sticker) => sticker.id.startsWith('photo-'))
  assert.equal(photoStickers.length, sources.length)
  for (const source of sources) {
    const name = source.replace(/\.[^.]+$/, '')
    assert.ok(photoStickers.some((sticker) => sticker.id === `photo-${name}`))
  }
  assert.equal(new Set(stickerCollection.map((sticker) => sticker.id)).size, stickerCollection.length)
  assert.equal(stickerPages.filter((page) => page.key.startsWith('sheet')).length, 10)
  for (const sticker of stickerCollection) {
    assert.ok(assetExists(sticker.file), `Missing sticker: ${sticker.file}`)
    assert.ok(assetExists(sticker.notificationFile), `Missing notification card: ${sticker.notificationFile}`)
  }
})

test('the new image letter is featured, dated, archived first, and keeps text letters intact', () => {
  assert.equal(content.finale.awaiting, false)
  assert.equal(content.finale.image, content.previousLetters[0].image)
  assert.match(content.finale.date, /October 21, 2026.*11:47 AM.*added/)
  assert.ok(assetExists(content.finale.image))
  assert.ok(content.finale.imageAlt)
  assert.ok(content.previousLetters[0].preview)
  assert.equal(typeof content.finale.body, 'string')
  assert.equal(content.previousLetters.length, 3)
  for (const letter of content.previousLetters.slice(1)) {
    assert.ok(letter.body.length > 0)
    assert.ok(letter.signoff.length > 0)
  }
})

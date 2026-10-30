import test from 'node:test'
import assert from 'node:assert/strict'
import { loveNoteForSlot, noteCollections, NOTE_PERIODS, validateNoteCollections } from './loveNotes.js'

test('every authored note is unique, expressive, and within the push budget', () => {
  validateNoteCollections()
  assert.equal(Object.values(noteCollections).flat().length, 107)
})

test('a year of sends avoids repeating themes within three sends and bodies within 80 sends', () => {
  const lastTheme = new Map()
  const lastBody = new Map()
  const seen = new Set()
  for (let slot = 0; slot < 365 * 3; slot++) {
    const day = 20727 + Math.floor(slot / 3)
    const period = NOTE_PERIODS[slot % 3]
    const note = loveNoteForSlot(day, period)
    assert.deepEqual(loveNoteForSlot(day, period), note, 'retries must reproduce the same note')
    if (lastTheme.has(note.theme)) assert.ok(slot - lastTheme.get(note.theme) >= 4, note.id)
    if (lastBody.has(note.body)) assert.ok(slot - lastBody.get(note.body) >= 80, note.id)
    lastTheme.set(note.theme, slot)
    lastBody.set(note.body, slot)
    seen.add(note.id)
  }
  for (const note of Object.values(noteCollections).flat()) {
    assert.ok(seen.has(note.id), `${note.id} must be reachable`)
  }
})

test('companion visits vary days and periods, and their attribution stays honest', () => {
  const goldieSlots = new Set()
  const goldiePeriods = new Set()
  for (let day = 20727; day < 20727 + 120; day++) {
    for (const period of NOTE_PERIODS) {
      const note = loveNoteForSlot(day, period)
      if (note.theme === 'goldie') {
        assert.equal(note.sender, 'goldie')
        goldieSlots.add(day % 7)
        goldiePeriods.add(period)
        assert.match(note.body, /🐕|🐶|🐾/u)
      } else {
        assert.equal(note.sender, 'rajesh')
      }
    }
  }
  assert.ok(goldieSlots.size >= 5)
  assert.equal(goldiePeriods.size, 3)
})

test('both requested Telugu lines can arrive at night', () => {
  const bodies = new Set(Array.from({ length: 365 }, (_, index) => loveNoteForSlot(20727 + index, 'night').body))
  assert.ok([...bodies].some((body) => body.includes('NUVVU ADRUSTAVANTHURALIVI PAPA')))
  assert.ok([...bodies].some((body) => body.includes('ENNI POOJALU CHESAVO, NEEKU NEN DORKIA HIHIHI')))
})

test('invalid notification inputs fail explicitly', () => {
  for (const day of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => loveNoteForSlot(day, 'morning'), /Invalid love-note day/)
  }
  assert.throws(() => loveNoteForSlot(20727, 'lunch'), /Unknown love-note period/)
})

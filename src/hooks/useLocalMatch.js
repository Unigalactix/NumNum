import { useCallback, useRef, useState } from 'react'

export function readLocalMatch(key, initial, validate, storage = () => globalThis.localStorage) {
  try {
    const saved = storage().getItem(key)
    if (saved !== null) {
      const value = JSON.parse(saved)
      if (!validate(value)) throw new Error('Invalid saved match')
      return { value, error: null }
    }
  } catch (error) {
    console.error(`Could not restore ${key}`, error)
    return { value: typeof initial === 'function' ? initial() : initial, error: 'This saved match could not be restored. You can start a new match; the old save stays untouched until you play.' }
  }
  return { value: typeof initial === 'function' ? initial() : initial, error: null }
}

export function writeLocalMatch(key, value, storage = () => globalThis.localStorage) {
  try {
    storage().setItem(key, JSON.stringify(value))
    return null
  } catch (error) {
    console.error(`Could not save ${key}`, error)
    return 'This match could not be saved on this device. You can keep playing, but progress may be lost when you leave.'
  }
}

export function changeLocalMatch(state, key, change, expected, storage) {
  if (state.key !== key || expected !== undefined && state.value !== expected) return state
  const next = typeof change === 'function' ? change(state.value) : change
  if (Object.is(next, state.value)) return state
  return { key, value: next, error: writeLocalMatch(key, next, storage) }
}

export function useLocalMatch(game, initial, version = 1, validate = () => true) {
  const key = `numnum-match-${game}-v${version}`
  const [state, setState] = useState(() => ({ key, ...readLocalMatch(key, initial, validate) }))
  const latest = useRef(state)
  let current = state
  if (state.key !== key) {
    current = { key, ...readLocalMatch(key, initial, validate) }
    latest.current = current
    setState(current)
  }
  const update = useCallback((change, expected) => {
    // Reject callbacks from an old render, including a second tap before React renders.
    const updated = changeLocalMatch(latest.current, key, change, expected)
    if (updated === latest.current) return false
    latest.current = updated
    setState(updated)
    return true
  }, [key])
  return [current.value, update, current.error]
}
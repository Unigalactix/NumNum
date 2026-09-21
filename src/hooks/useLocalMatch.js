import { useCallback, useRef, useState } from 'react'

export function useLocalMatch(game, initial, version = 1) {
  const key = `numnum-match-${game}-v${version}`
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved) return JSON.parse(saved)
    } catch {}
    return typeof initial === 'function' ? initial() : initial
  })
  const latest = useRef(value)
  const update = useCallback((change) => {
    const next = typeof change === 'function' ? change(latest.current) : change
    latest.current = next
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {}
    setValue(next)
  }, [key])
  return [value, update]
}
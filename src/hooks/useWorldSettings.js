import { useEffect, useState } from 'react'

const STORAGE_KEY = 'numnum-world'
const DEFAULTS = { theme: 'system', sky: 'cloudy', companion: 'goldie', animate: true }

function loadSettings() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return { settings: DEFAULTS, error: '' }
    const saved = JSON.parse(value)
    if (
      !saved || !['system', 'light', 'dark'].includes(saved.theme) ||
      !['sunny', 'cloudy', 'rainy'].includes(saved.sky) ||
      !['goldie', 'cartoon', 'none'].includes(saved.companion) ||
      typeof saved.animate !== 'boolean'
    ) {
      throw new Error('Unrecognized saved world settings')
    }
    return { settings: saved, error: '' }
  } catch (error) {
    console.error('Could not restore world settings:', error)
    return { settings: DEFAULTS, error: 'Your saved appearance could not be loaded. Using device settings for now.' }
  }
}

export function useWorldSettings() {
  const [initial] = useState(loadSettings)
  const [settings, setSettings] = useState(initial.settings)
  const [error, setError] = useState(initial.error)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const theme = settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : settings.theme

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.sky = settings.sky
    document.documentElement.dataset.ambientMotion = settings.animate ? 'on' : 'off'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#141923' : '#f8f6f4')
  }, [theme, settings.sky, settings.animate])

  function updateSettings(patch) {
    const next = { ...settings, ...patch }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setError('')
    } catch (error) {
      console.error('Could not save world settings:', error)
      setError('This browser could not save your appearance. Changes will last until you leave this page.')
    }
  }

  return { settings, theme, updateSettings, error }
}

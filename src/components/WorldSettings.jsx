import { Cloud, CloudRain, Monitor, Moon, Settings2, Sun } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import Modal from './Modal'

export default function WorldSettings({ settings, theme, updateSettings, error }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="world-nav-button"
        type="button"
        onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
      </button>
      <button className="world-nav-button" type="button" onClick={() => setOpen(true)} aria-label="Our little world settings" title="Our little world settings">
        <Settings2 size={18} aria-hidden="true" />
      </button>
      {createPortal(
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="world-settings">
            <p className="editorial-label pr-10">Make yourself at home</p>
            <h2 className="mt-2 font-display text-3xl">Our little world</h2>
            <fieldset className="mt-6">
              <legend className="mb-3 text-sm font-semibold">Daylight or stargazing</legend>
              <div className="flex flex-wrap gap-2">
                {[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'Device', Monitor]].map(([value, label, Icon]) => (
                  <button key={value} type="button" className="btn-ghost !px-3" aria-pressed={settings.theme === value} onClick={() => updateSettings({ theme: value })}>
                    <Icon size={16} aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-5">
              <legend className="mb-3 text-sm font-semibold">A Seattle sky mood</legend>
              <div className="flex flex-wrap gap-2">
                {[['sunny', 'Sunny', Sun], ['cloudy', 'Cloudy', Cloud], ['rainy', 'Rainy', CloudRain]].map(([value, label, Icon]) => (
                  <button key={value} type="button" className="btn-ghost !px-3" aria-pressed={settings.sky === value} onClick={() => updateSettings({ sky: value })}>
                    <Icon size={16} aria-hidden="true" />{label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                An atmosphere you choose for light mode, not a live forecast.
                Live weather and location-based clothing notes are not connected. We do not collect your location.
              </p>
            </fieldset>
            <label className="mt-5 block text-sm font-semibold" htmlFor="world-companion">A little company</label>
            <select id="world-companion" className="world-select mt-2" value={settings.companion} onChange={(event) => updateSettings({ companion: event.target.value })}>
              <option value="goldie">Goldie, our golden puppy</option>
              <option value="cartoon">Cartoon corner</option>
              <option value="none">Quiet time, just us</option>
            </select>
            <label className="mt-5 flex items-center gap-3 text-sm">
              <input type="checkbox" checked={settings.animate} onChange={(event) => updateSettings({ animate: event.target.checked })} />
              Gentle sky and companion motion
            </label>
            <p className="mt-2 text-xs text-muted">Your device’s reduced-motion preference always takes priority.</p>
            {error && <p className="mt-4 text-sm text-wine" role="alert">{error}</p>}
          </div>
        </Modal>,
        document.body,
      )}
    </>
  )
}

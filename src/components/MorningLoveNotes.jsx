import { useEffect, useState } from 'react'
import { Bell, BellOff, Check, Clock3, LoaderCircle } from 'lucide-react'
import {
  disableMorningNotes,
  enableMorningNotes,
  notificationStatus,
  notificationSupport,
} from '../lib/oneSignal'

const INITIAL = { permission: 'default', subscribed: false }

export default function MorningLoveNotes() {
  const support = notificationSupport()
  const iosNeedsInstall =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.matchMedia('(display-mode: standalone)').matches &&
    !navigator.standalone
  const [status, setStatus] = useState(INITIAL)
  const [busy, setBusy] = useState(support.configured && support.supported && !iosNeedsInstall)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!support.configured || !support.supported || iosNeedsInstall) return

    let active = true
    notificationStatus()
      .then((next) => active && setStatus(next))
      .catch(() => {
        if (!active) return
        const permission = Notification.permission
        setStatus({ permission, subscribed: false })
        if (permission !== 'denied') setError('Morning notes could not be loaded right now.')
      })
      .finally(() => active && setBusy(false))

    return () => {
      active = false
    }
  }, [iosNeedsInstall, support.configured, support.supported])

  const toggle = async () => {
    setBusy(true)
    setError('')
    try {
      const next = status.subscribed
        ? await disableMorningNotes()
        : await enableMorningNotes()
      setStatus(next)
    } catch {
      setStatus((current) => ({ ...current, permission: Notification.permission }))
      setError('The browser could not update morning notes. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const denied = status.permission === 'denied'
  const enabled = status.subscribed && status.permission === 'granted'

  return (
    <section className="surface mt-8 grid gap-5 rounded-xl p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6" aria-labelledby="morning-notes-title">
      <span className={`grid h-11 w-11 place-items-center rounded-lg ${enabled ? 'bg-sage text-white' : 'bg-blush/65 text-wine'}`}>
        {enabled ? <Check size={20} aria-hidden="true" /> : <Bell size={20} aria-hidden="true" />}
      </span>

      <div>
        <p className="editorial-label">A daily ritual</p>
        <h2 id="morning-notes-title" className="mt-1 font-display text-2xl text-ink">
          Morning love notes
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm leading-relaxed text-muted">
          <Clock3 size={14} className="shrink-0" aria-hidden="true" />
          One new note every day around 9:00 AM, in your local time.
        </p>
        {!support.configured && (
          <p className="mt-2 text-sm text-muted">The morning-note service is being prepared.</p>
        )}
        {!support.supported && support.configured && (
          <p className="mt-2 text-sm text-muted">This browser does not support web notifications.</p>
        )}
        {iosNeedsInstall && support.configured && (
          <p className="mt-2 text-sm text-muted">In Safari, first choose Share, then Add to Home Screen. Open NumNum there to enable notes.</p>
        )}
        {denied && (
          <p className="mt-2 text-sm text-wine">Notifications are blocked in this browser’s site settings.</p>
        )}
        {error && <p className="mt-2 text-sm text-wine" role="status">{error}</p>}
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={busy || denied || iosNeedsInstall || !support.configured || !support.supported}
        className={enabled ? 'btn-ghost min-w-36' : 'btn min-w-36'}
        aria-pressed={enabled}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
        ) : enabled ? (
          <BellOff size={17} aria-hidden="true" />
        ) : (
          <Bell size={17} aria-hidden="true" />
        )}
        {busy ? 'Checking…' : enabled ? 'Pause notes' : iosNeedsInstall ? 'Install first' : 'Enable notes'}
      </button>
    </section>
  )
}

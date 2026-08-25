import { useEffect, useState } from 'react'
import { Bell, BellOff, LoaderCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  disableMorningNotes,
  enableMorningNotes,
  notificationStatus,
  notificationSupport,
} from '../lib/oneSignal'
import { tap } from '../lib/motion'
import Modal from './Modal'

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
  const [confirmPause, setConfirmPause] = useState(false)

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
    if (status.subscribed) {
      setError('')
      setConfirmPause(true)
      return
    }

    setBusy(true)
    setError('')
    try {
      const next = await enableMorningNotes()
      setStatus(next)
    } catch {
      setStatus((current) => ({ ...current, permission: Notification.permission }))
      setError('The browser could not update morning notes. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const pause = async () => {
    setBusy(true)
    setError('')
    try {
      const next = await disableMorningNotes()
      setStatus(next)
      setConfirmPause(false)
    } catch {
      setStatus((current) => ({ ...current, permission: Notification.permission }))
      setError('The browser could not pause your love notes. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const denied = status.permission === 'denied'
  const enabled = status.subscribed && status.permission === 'granted'
  const unavailable = !support.configured || !support.supported
  const disabled = busy || denied || iosNeedsInstall || unavailable
  const label = busy
    ? 'Checking daily love notes'
    : enabled
      ? 'Pause daily love notes'
      : denied
        ? 'Notifications are blocked in browser settings'
        : iosNeedsInstall
          ? 'Add NumNum to your Home Screen to enable notifications'
          : unavailable
            ? 'Daily love notes are unavailable'
            : error || 'Enable daily love notes'

  return (
    <>
      <motion.button
        type="button"
        whileTap={tap}
        onClick={toggle}
        disabled={disabled}
        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-lg transition ${
          enabled ? 'bg-white text-wine shadow-soft' : 'text-muted hover:bg-white/65 hover:text-ink'
        } disabled:cursor-not-allowed disabled:opacity-45`}
        aria-pressed={enabled}
        aria-label={label}
        title={label}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
        ) : enabled ? (
          <BellOff size={17} aria-hidden="true" />
        ) : (
          <Bell size={17} aria-hidden="true" />
        )}
        {enabled && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />}
      </motion.button>

      {typeof document !== 'undefined' && createPortal(
        <Modal open={confirmPause} onClose={() => !busy && setConfirmPause(false)}>
          <div className="text-center">
            <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-lg bg-blush/65 text-wine">
              <BellOff size={21} aria-hidden="true" />
            </span>
            <h3 className="font-display text-3xl text-ink">Pause your daily love notes?</h3>
            <p className="mt-3 leading-relaxed text-muted">
              Your mornings and afternoons will be a little quieter. You can turn them back on anytime from the bell.
            </p>
            {error && <p className="mt-3 text-sm text-wine" role="status">{error}</p>}
            <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setConfirmPause(false)}
                disabled={busy}
                className="btn-ghost"
              >
                Keep them coming
              </button>
              <button type="button" onClick={pause} disabled={busy} className="btn">
                {busy && <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />}
                {busy ? 'Pausing…' : 'Okay, pause them'}
              </button>
            </div>
          </div>
        </Modal>,
        document.body,
      )}
    </>
  )
}

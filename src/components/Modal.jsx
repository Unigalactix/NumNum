import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// A soft, rounded modal used for revealed notes & the finale letter
export default function Modal({ open, onClose, children, wide = false }) {
  const panelRef = useRef(null)

  // Keep keyboard focus inside the dialog and return it to the opener on close.
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    panelRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) {
        e.preventDefault()
        panelRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (
        e.shiftKey &&
        (document.activeElement === first || document.activeElement === panelRef.current)
      ) {
        e.preventDefault()
        last.focus()
      } else if (
        !e.shiftKey &&
        (document.activeElement === last || !panelRef.current.contains(document.activeElement))
      ) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-rose/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Dialog"
            tabIndex={-1}
            className={`glass relative w-full ${
              wide ? 'max-w-2xl' : 'max-w-md'
            } rounded-3xl p-8 shadow-soft outline-none`}
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/70 text-rose transition hover:scale-105"
              >
                ✕
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

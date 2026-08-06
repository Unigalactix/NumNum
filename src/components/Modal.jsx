import { AnimatePresence, motion } from 'framer-motion'

// A soft, rounded modal used for revealed notes & the finale letter
export default function Modal({ open, onClose, children, wide = false }) {
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
            className={`glass relative w-full ${
              wide ? 'max-w-2xl' : 'max-w-md'
            } rounded-3xl p-8 shadow-soft`}
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          >
            {onClose && (
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/70 text-rose transition hover:scale-110"
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

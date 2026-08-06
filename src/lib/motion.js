// One shared motion vocabulary so every transition feels like the same system.
export const spring = { type: 'spring', stiffness: 260, damping: 24 }
export const softSpring = { type: 'spring', stiffness: 120, damping: 18 }
export const gentle = { duration: 0.5, ease: [0.22, 1, 0.36, 1] }

// Buttery page/view transition: fade + tiny scale + a whisper of blur.
export const pageTransition = {
  initial: { opacity: 0, scale: 0.985, filter: 'blur(6px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.985, filter: 'blur(6px)' },
  transition: gentle,
}

// Tactile press used on buttons and cards.
export const tap = { scale: 0.97 }

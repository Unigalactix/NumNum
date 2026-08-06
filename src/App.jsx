import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { content } from './content'
import { useStore } from './store'
import { useSound } from './hooks/useSound'
import { useStickerSheet } from './hooks/useStickerSheet'
import { useAmbientMusic } from './hooks/useAmbientMusic'
import { spriteCellStyle } from './lib/sprite'
import { pageTransition, spring, tap } from './lib/motion'

import FloatingHearts from './components/FloatingHearts'
import GrainOverlay from './components/GrainOverlay'
import HeartTrail from './components/HeartTrail'
import Confetti from './components/Confetti'
import Modal from './components/Modal'
import Hub from './components/Hub'
import FinaleLetter from './components/FinaleLetter'
import StickerBook from './components/StickerBook'

import RiddleGate from './games/RiddleGate'
import MemoryMatch from './games/MemoryMatch'
import Quiz from './games/Quiz'
import ScratchCard from './games/ScratchCard'
import Puzzle from './games/Puzzle'
import LoveMeter from './games/LoveMeter'

const GAME_COMPONENTS = {
  memory: MemoryMatch,
  quiz: Quiz,
  scratch: ScratchCard,
  puzzle: Puzzle,
  lovemeter: LoveMeter,
}

export default function App() {
  const entered = useStore((s) => s.entered)
  const muted = useStore((s) => s.muted)
  const toggleMute = useStore((s) => s.toggleMute)
  const musicOn = useStore((s) => s.musicOn)
  const toggleMusic = useStore((s) => s.toggleMusic)
  const completeGame = useStore((s) => s.completeGame)
  const completed = useStore((s) => s.completed)
  const reset = useStore((s) => s.reset)
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const play = useSound()
  useAmbientMusic()

  const [note, setNote] = useState(null) // reward note after a game
  const [noteSticker, setNoteSticker] = useState(null) // random sticker for the note
  const [celebrate, setCelebrate] = useState(false) // confetti burst on a win

  const { sheet, sheetUrl, sheetOk } = useStickerSheet()

  // Preload the puzzle photo at startup so it never "pops in" when the game opens.
  useEffect(() => {
    const src = content.puzzleImage || content.photos?.[0]
    if (!src) return
    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}${src}`
  }, [])

  const ActiveGame =
    view !== 'hub' && view !== 'finale' && view !== 'stickers'
      ? GAME_COMPONENTS[view]
      : null

  const handleComplete = (id) => {
    const alreadyDone = !!completed[id]
    completeGame(id)
    // only celebrate the first time a game is finished — replays return quietly
    if (!alreadyDone) {
      setNote(content.notes[id])
      const list = content.stickers
      setNoteSticker(list?.length ? list[Math.floor(Math.random() * list.length)] : null)
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 2200)
    }
    setView('hub')
  }

  return (
    <div className="relative min-h-screen">
      <FloatingHearts />
      <GrainOverlay />
      {entered && <HeartTrail />}
      {celebrate && <Confetti />}

      {/* top controls */}
      {entered && (
        <div className="fixed right-4 top-4 z-40 flex gap-2">
          <motion.button
            whileTap={tap}
            onClick={() => {
              play('click')
              toggleMusic()
            }}
            aria-label={musicOn ? 'Turn music off' : 'Turn music on'}
            className="grid h-11 w-11 place-items-center rounded-full glass text-xl transition hover:scale-110"
          >
            {musicOn ? '🎶' : '🎵'}
          </motion.button>
          <motion.button
            whileTap={tap}
            onClick={() => {
              play('click')
              toggleMute()
            }}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="grid h-11 w-11 place-items-center rounded-full glass text-xl transition hover:scale-110"
          >
            {muted ? '🔇' : '🔊'}
          </motion.button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div key="gate" exit={{ opacity: 0 }}>
            <RiddleGate />
          </motion.div>
        ) : view === 'hub' ? (
          <motion.div key="hub" {...pageTransition}>
            <Hub
              onOpenGame={(id) => setView(id)}
              onOpenFinale={() => setView('finale')}
              onOpenStickers={() => setView('stickers')}
            />
            <Footer onReset={reset} play={play} />
          </motion.div>
        ) : view === 'finale' ? (
          <motion.div key="finale" {...pageTransition}>
            <FinaleLetter onClose={() => setView('hub')} />
          </motion.div>
        ) : view === 'stickers' ? (
          <motion.div key="stickers" {...pageTransition}>
            <StickerBook onClose={() => setView('hub')} />
          </motion.div>
        ) : (
          <motion.div
            key={view}
            {...pageTransition}
            className="mx-auto max-w-3xl px-5 pb-24 pt-16"
          >
            <motion.button
              whileTap={tap}
              onClick={() => {
                play('click')
                setView('hub')
              }}
              className="btn-ghost mb-6"
            >
              ← back
            </motion.button>
            <div className="glass rounded-[2rem] p-6 sm:p-8">
              <ActiveGame onComplete={() => handleComplete(view)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* reward note after finishing a game */}
      <Modal open={!!note} onClose={() => setNote(null)}>
        {note && (
          <div className="text-center">
            {sheetOk && noteSticker ? (
              <motion.div
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={spring}
                className="mx-auto mb-3 h-28 w-28"
                style={spriteCellStyle(sheetUrl, sheet, noteSticker.r, noteSticker.c)}
              />
            ) : (
              <div className="mb-3 text-5xl">💝</div>
            )}
            <h3 className="gradient-text font-script text-3xl">{note.title}</h3>
            <p className="mt-3 text-lg text-[#6b4560]">{note.body}</p>
            <motion.button whileTap={tap} onClick={() => setNote(null)} className="btn mt-6">
              aww 💕
            </motion.button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function Footer({ onReset, play }) {
  return (
    <footer className="pointer-events-none fixed bottom-3 left-0 right-0 z-30 flex justify-center">
      <button
        onClick={() => {
          play('click')
          if (confirm('Replay everything from the start?')) onReset()
        }}
        className="pointer-events-auto rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold text-rose/80 backdrop-blur transition hover:bg-white/80"
      >
        ↺ start over
      </button>
    </footer>
  )
}

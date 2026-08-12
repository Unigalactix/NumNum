import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { content } from './content'
import { useStore } from './store'
import { useSound } from './hooks/useSound'
import { useStickerSheet } from './hooks/useStickerSheet'
import { useAmbientMusic } from './hooks/useAmbientMusic'
import { spriteCellStyle } from './lib/sprite'
import { pageTransition, spring, tap } from './lib/motion'

import FloatingHearts from './components/FloatingHearts'
import GrainOverlay from './components/GrainOverlay'
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
import Pinpoint from './games/Pinpoint'
import Tango from './games/Tango'
import MiniSudoku from './games/MiniSudoku'
import Zip from './games/Zip'
import Wend from './games/Wend'
import Patches from './games/Patches'

const GAME_COMPONENTS = {
  memory: MemoryMatch,
  quiz: Quiz,
  scratch: ScratchCard,
  puzzle: Puzzle,
  lovemeter: LoveMeter,
  pinpoint: Pinpoint,
  tango: Tango,
  sudoku: MiniSudoku,
  zip: Zip,
  wend: Wend,
  patches: Patches,
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
  const reduce = useReducedMotion()

  const [note, setNote] = useState(null) // reward note after a game
  const [noteSticker, setNoteSticker] = useState(null) // random sticker for the note
  const [celebrate, setCelebrate] = useState(false) // confetti burst on a win
  const [askReset, setAskReset] = useState(false) // styled "start over?" confirm
  const [splash, setSplash] = useState(!reduce) // brief intro splash on first load

  const { sheet, sheetUrl, sheetOk } = useStickerSheet()

  // Fade the intro splash out shortly after load.
  useEffect(() => {
    if (!splash) return
    const id = setTimeout(() => setSplash(false), 1500)
    return () => clearTimeout(id)
  }, [splash])

  // Render every emoji as a Twemoji image so it looks identical on every device.
  useEffect(() => {
    let tries = 0
    const parse = () =>
      window.twemoji
        ? (window.twemoji.parse(document.body, { folder: 'svg', ext: '.svg' }), true)
        : false
    if (parse()) return
    const id = setInterval(() => {
      if (parse() || ++tries > 40) clearInterval(id)
    }, 100)
    return () => clearInterval(id)
  }, [view, entered, note, celebrate, splash, askReset])

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
      {celebrate && <Confetti />}

      <AnimatePresence>
        {splash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[60] grid place-items-center"
            style={{ background: 'linear-gradient(135deg,#ffe3f1,#e9dcff,#d3f7ee)' }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={spring}
              className="text-center"
            >
              <div className="text-7xl">💗</div>
              <p className="gradient-text mt-3 font-script text-4xl">For My Num Num</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <Footer onAskReset={() => setAskReset(true)} play={play} />
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

      {/* styled "start over" confirmation (replaces the native confirm dialog) */}
      <Modal open={askReset} onClose={() => setAskReset(false)}>
        <div className="text-center">
          <div className="mb-3 text-5xl">↺</div>
          <h3 className="gradient-text font-script text-3xl">Start over?</h3>
          <p className="mt-3 text-[#6b4560]">
            This clears your progress and replays everything from the very beginning.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setAskReset(false)} className="btn-ghost">
              stay here
            </button>
            <button
              onClick={() => {
                play('click')
                reset()
                setAskReset(false)
              }}
              className="btn"
            >
              start over
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Footer({ onAskReset, play }) {
  return (
    <footer className="pointer-events-none fixed bottom-3 left-0 right-0 z-30 flex justify-center">
      <button
        onClick={() => {
          play('click')
          onAskReset()
        }}
        className="pointer-events-auto rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold text-rose/80 backdrop-blur transition hover:bg-white/80"
      >
        ↺ start over
      </button>
    </footer>
  )
}

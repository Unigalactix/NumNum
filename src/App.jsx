import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { content } from './content'
import { DAY_MS, useStore } from './store'
import { useStickerSheet } from './hooks/useStickerSheet'
import { spriteCellStyle } from './lib/sprite'
import { pageTransition, spring, tap } from './lib/motion'

import FloatingHearts from './components/FloatingHearts'
import GrainOverlay from './components/GrainOverlay'
import Confetti from './components/Confetti'
import Modal from './components/Modal'
import Hub from './components/Hub'
import FinaleLetter from './components/FinaleLetter'
import StickerBook from './components/StickerBook'
import PreviousLetters from './components/PreviousLetters'
import HistoryOfUs from './components/HistoryOfUs'

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
import ArrowTrail from './games/ArrowTrail'
import SweetMatch from './games/SweetMatch'
import PocketBlocks from './games/PocketBlocks'
import DuckHunt from './games/DuckHunt'

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
  arrowtrail: ArrowTrail,
  sweetmatch: SweetMatch,
  pocketblocks: PocketBlocks,
  duckhunt: DuckHunt,
}

export default function App() {
  const entered = useStore((s) => s.entered)
  const completeGame = useStore((s) => s.completeGame)
  const completed = useStore((s) => s.completed)
  const reset = useStore((s) => s.reset)
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const cycleStartedAt = useStore((s) => s.cycleStartedAt)
  const syncCycle = useStore((s) => s.syncCycle)
  const reduce = useReducedMotion()

  const [note, setNote] = useState(null) // reward note after a game
  const [noteSticker, setNoteSticker] = useState(null) // random sticker for the note
  const [celebrate, setCelebrate] = useState(false) // confetti burst on a win
  const [askReset, setAskReset] = useState(false) // styled "start over?" confirm
  const [splash, setSplash] = useState(!reduce) // brief intro splash on first load
  const [cycleReady, setCycleReady] = useState(false)

  const { sheet, sheetUrl, sheetOk } = useStickerSheet()

  // A new featured letter or a completed 24-hour cycle starts the site fresh.
  useEffect(() => {
    const sync = () => syncCycle(content.finale.version)
    sync()
    setCycleReady(true)

    const elapsed = Date.now() - useStore.getState().cycleStartedAt
    const timeout = setTimeout(sync, Math.max(0, DAY_MS - elapsed) + 100)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') sync()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [cycleStartedAt, syncCycle])

  // Fade the intro splash out shortly after load.
  useEffect(() => {
    if (!splash) return
    const id = setTimeout(() => setSplash(false), 1500)
    return () => clearTimeout(id)
  }, [splash])

  // Parse the initial app once, then only newly rendered subtrees.
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    let tries = 0
    let retryId
    let observer
    const parse = (node) => {
      if (!window.twemoji) return false
      window.twemoji.parse(node, { folder: 'svg', ext: '.svg' })
      return true
    }
    const start = () => {
      if (!parse(root)) return false
      observer = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (!node.matches?.('img.emoji, img.twemoji')) parse(node)
            } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              parse(node.parentElement)
            }
          })
        })
      })
      observer.observe(root, { childList: true, subtree: true })
      return true
    }

    if (!start()) {
      retryId = setInterval(() => {
        if (start() || ++tries > 40) clearInterval(retryId)
      }, 100)
    }
    return () => {
      clearInterval(retryId)
      observer?.disconnect()
    }
  }, [])

  // Preload the puzzle photo at startup so it never "pops in" when the game opens.
  useEffect(() => {
    const src = content.puzzleImage || content.photos?.[0]
    if (!src) return
    const img = new Image()
    img.src = `${import.meta.env.BASE_URL}${src}`
  }, [])

  const ActiveGame =
    view !== 'hub' &&
    view !== 'finale' &&
    view !== 'stickers' &&
    view !== 'letters' &&
    view !== 'history'
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

  if (!cycleReady) {
    return (
      <div className="grid min-h-screen place-items-center text-6xl" aria-label="Preparing our little world">
        💗
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <FloatingHearts count={ActiveGame ? 0 : 4} />
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
              onOpenLetters={() => setView('letters')}
              onOpenHistory={() => setView('history')}
            />
            <Footer onAskReset={() => setAskReset(true)} />
          </motion.div>
        ) : view === 'finale' ? (
          <motion.div key="finale" {...pageTransition}>
            <FinaleLetter
              onClose={() => setView('hub')}
              onOpenPrevious={() => setView('letters')}
            />
          </motion.div>
        ) : view === 'stickers' ? (
          <motion.div key="stickers" {...pageTransition}>
            <StickerBook onClose={() => setView('hub')} />
          </motion.div>
        ) : view === 'letters' ? (
          <motion.div key="letters" {...pageTransition}>
            <PreviousLetters onClose={() => setView('hub')} />
          </motion.div>
        ) : view === 'history' ? (
          <motion.div key="history" {...pageTransition}>
            <HistoryOfUs onClose={() => setView('hub')} />
          </motion.div>
        ) : (
          <motion.div
            key={view}
            {...pageTransition}
            className="mx-auto max-w-3xl px-5 pb-24 pt-16"
          >
            <motion.button
              whileTap={tap}
              onClick={() => setView('hub')}
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
                className="mx-auto mb-3 w-36 max-w-full"
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

function Footer({ onAskReset }) {
  return (
    <footer className="pointer-events-none fixed bottom-3 left-0 right-0 z-30 flex justify-center">
      <button
        onClick={onAskReset}
        className="pointer-events-auto rounded-full bg-white/50 px-4 py-1.5 text-xs font-semibold text-rose/80 backdrop-blur transition hover:bg-white/80"
      >
        ↺ start over
      </button>
    </footer>
  )
}

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Heart, RotateCcw } from 'lucide-react'
import { content } from './content'
import { DAY_MS, useStore } from './store'
import { useStickerSheet } from './hooks/useStickerSheet'
import { spriteCellStyle } from './lib/sprite'
import { pageTransition, spring, tap } from './lib/motion'

import GrainOverlay from './components/GrainOverlay'
import Confetti from './components/Confetti'
import Modal from './components/Modal'
import AppNav from './components/AppNav'
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

const GAME_TITLES = {
  memory: 'Memory of Us',
  quiz: 'How Well You Know Us',
  scratch: 'A Secret For You',
  puzzle: 'Piece Us Together',
  lovemeter: 'The Love Meter',
  pinpoint: 'Pinpoint Us',
  tango: 'Hearts & Stars',
  sudoku: 'Mini Sudoku',
  zip: 'Zip',
  wend: 'Wend',
  patches: 'Patches',
  arrowtrail: 'Arrow Trail',
  sweetmatch: 'Sweet Match',
  pocketblocks: 'Pocket Blocks',
  duckhunt: 'Mini Duck Hunt',
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view])

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
      <GrainOverlay />
      {celebrate && <Confetti />}

      <AnimatePresence>
        {splash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[60] grid place-items-center bg-porcelain"
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
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-ink font-display text-3xl text-white">N</div>
              <p className="mt-5 font-display text-4xl text-ink">For My Num Num</p>
              <p className="editorial-label mt-2">A private archive</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {entered && <AppNav view={view} onNavigate={setView} />}

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
            className="mx-auto max-w-5xl px-5 pb-24 pt-10"
          >
            <div className="mb-6 flex items-center gap-4">
              <motion.button
                whileTap={tap}
                onClick={() => setView('hub')}
                className="icon-button"
                aria-label="Back to home"
                title="Back to home"
              >
                <ArrowLeft size={19} aria-hidden="true" />
              </motion.button>
              <div>
                <p className="editorial-label">Today’s collection</p>
                <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">{GAME_TITLES[view]}</h1>
              </div>
            </div>
            <div className="game-shell surface rounded-2xl p-5 sm:p-8">
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
              <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-lg bg-blush/70 text-wine">
                <Heart size={22} strokeWidth={1.7} aria-hidden="true" />
              </span>
            )}
            <h3 className="font-display text-3xl text-ink">{note.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{note.body}</p>
            <motion.button whileTap={tap} onClick={() => setNote(null)} className="btn mt-6">
              Continue
            </motion.button>
          </div>
        )}
      </Modal>

      {/* styled "start over" confirmation (replaces the native confirm dialog) */}
      <Modal open={askReset} onClose={() => setAskReset(false)}>
        <div className="text-center">
          <span className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-lg bg-lavender text-muted">
            <RotateCcw size={21} aria-hidden="true" />
          </span>
          <h3 className="font-display text-3xl text-ink">Start over?</h3>
          <p className="mt-3 leading-relaxed text-muted">
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
    <footer className="mx-auto flex max-w-6xl justify-center border-t border-[#e4dde0] px-5 py-8 sm:px-6">
      <button
        onClick={onAskReset}
        className="flex items-center gap-2 rounded-lg border border-[#e4dde0] bg-white/80 px-3 py-2 text-xs font-semibold text-muted transition hover:border-wine/35 hover:text-wine"
        title="Start over"
      >
        <RotateCcw size={14} aria-hidden="true" />
        start over
      </button>
    </footer>
  )
}

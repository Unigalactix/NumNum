import { motion } from 'framer-motion'
import { content } from '../content'
import { useStore, GAME_IDS } from '../store'
import { useSound } from '../hooks/useSound'

const GAMES = [
  { id: 'memory', emoji: '🃏', title: 'Memory of Us', desc: 'Match every pair' },
  { id: 'quiz', emoji: '💭', title: 'How Well You Know Us', desc: 'A little quiz' },
  { id: 'scratch', emoji: '✨', title: 'A Secret For You', desc: 'Scratch to reveal' },
  { id: 'puzzle', emoji: '🧩', title: 'Piece Us Together', desc: 'Solve the picture' },
  { id: 'lovemeter', emoji: '💗', title: 'The Love Meter', desc: 'How much? find out' },
]

export default function Hub({ onOpenGame, onOpenFinale, onOpenStickers }) {
  const play = useSound()
  const completed = useStore((s) => s.completed)
  const doneCount = GAME_IDS.filter((id) => completed[id]).length
  const allDone = doneCount === GAME_IDS.length

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-8">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="gradient-text font-script text-5xl sm:text-6xl">
          {content.site.title}
        </h1>
        <p className="mt-2 text-lg text-[#7a5570]">{content.site.tagline}</p>

        {/* progress hearts */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {GAME_IDS.map((id) => (
            <motion.span
              key={id}
              animate={{ scale: completed[id] ? [1, 1.4, 1] : 1 }}
              className="text-2xl"
            >
              {completed[id] ? '💗' : '🤍'}
            </motion.span>
          ))}
        </div>
        <p className="mt-1 text-sm font-semibold text-rose/70">
          {doneCount} / {GAME_IDS.length} unlocked
        </p>

        <button
          onClick={() => {
            play('click')
            onOpenStickers()
          }}
          className="btn mt-5"
        >
          📖 Open our Sticker Book
        </button>
      </motion.header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => {
          const isDone = !!completed[g.id]
          return (
            <motion.button
              key={g.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              onClick={() => {
                play('click')
                onOpenGame(g.id)
              }}
              className="glass relative overflow-hidden rounded-3xl p-6 text-left shadow-soft"
            >
              <div className="text-5xl">{g.emoji}</div>
              <h3 className="mt-3 text-xl font-bold text-[#6b4560]">{g.title}</h3>
              <p className="text-sm text-[#7a5570]">{g.desc}</p>
              <span
                className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                  isDone ? 'bg-mint/60 text-emerald-700' : 'bg-white/70 text-rose'
                }`}
              >
                {isDone ? 'done 💗' : 'play'}
              </span>
            </motion.button>
          )
        })}

        {/* finale card */}
        <motion.button
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: GAMES.length * 0.08 }}
          whileHover={allDone ? { y: -6 } : {}}
          onClick={() => {
            if (!allDone) {
              play('error')
              return
            }
            play('unlock')
            onOpenFinale()
          }}
          className={`relative overflow-hidden rounded-3xl p-6 text-left shadow-soft ${
            allDone
              ? 'bg-gradient-to-br from-rose to-periwinkle text-white'
              : 'glass'
          }`}
        >
          <div className="text-5xl">{allDone ? '💌' : '🔒'}</div>
          <h3 className={`mt-3 text-xl font-bold ${allDone ? 'text-white' : 'text-[#6b4560]'}`}>
            The Final Letter
          </h3>
          <p className={`text-sm ${allDone ? 'text-white/90' : 'text-[#7a5570]'}`}>
            {allDone ? 'It’s ready — open it 💗' : 'Finish all 5 to unlock'}
          </p>
          {allDone && (
            <motion.span
              className="absolute right-4 top-4"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              ✨
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  )
}

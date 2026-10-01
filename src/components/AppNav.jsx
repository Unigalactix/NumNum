import { BookHeart, Clock3, Home, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { tap } from '../lib/motion'
import MorningLoveNotes from './MorningLoveNotes'
import WorldSettings from './WorldSettings'

const ITEMS = [
  { id: 'hub', label: 'Home', icon: Home },
  { id: 'history', label: 'Our story', icon: Clock3 },
  { id: 'letters', label: 'Letters', icon: Mail },
  { id: 'stickers', label: 'Album', icon: BookHeart },
]

export default function AppNav({ view, onNavigate, world }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e4dde0]/80 bg-porcelain/85 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-y-2 px-2 py-2 sm:px-6">
        <button
          onClick={() => onNavigate('hub')}
          className="group flex items-center gap-3 text-left"
          aria-label="For My Num Num, home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink font-display text-lg text-white">
            N
          </span>
          <span className="hidden lg:block">
            <span className="block font-display text-lg leading-none text-ink">For My Num Num</span>
            <span className="mt-1 block text-[10px] font-bold uppercase text-muted" style={{ letterSpacing: '0.14em' }}>
              Our private archive
            </span>
          </span>
        </button>

        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {ITEMS.map(({ id, label, icon: Icon }) => {
            const active = view === id
            return (
              <motion.button
                key={id}
                whileTap={tap}
                onClick={() => onNavigate(id)}
                className={`relative flex h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold transition sm:px-3 ${
                  active ? 'bg-white text-wine shadow-soft' : 'text-muted hover:bg-white/65 hover:text-ink'
                }`}
                aria-current={active ? 'page' : undefined}
                title={label}
              >
                <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                <span className="hidden md:inline">{label}</span>
              </motion.button>
            )
          })}
          <MorningLoveNotes />
          <WorldSettings {...world} />
        </nav>
      </div>
    </header>
  )
}
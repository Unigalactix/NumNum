import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff, Maximize2, X } from 'lucide-react'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { spring } from '../lib/motion'

const pageUrl = (file) => `${import.meta.env.BASE_URL}${file}`

export default function StickerBook({ onClose }) {
  const play = useSound()
  const pages = content.stickerPages || []
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [failed, setFailed] = useState({})
  const [loaded, setLoaded] = useState({})
  const zoomRef = useRef(null)

  const page = pages[index]
  const total = pages.length

  useEffect(() => {
    if (!zoom) return
    zoomRef.current?.focus()
  }, [zoom])

  const go = (next) => {
    if (total < 2) return
    const target = (next + total) % total
    if (target === index) return
    play('flip')
    setDir(next > index ? 1 : -1)
    setIndex(target)
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <button
        onClick={() => {
          play('click')
          onClose()
        }}
        className="icon-button mb-8"
        aria-label="Back to home"
        title="Back to home"
      >
        <ArrowLeft size={19} aria-hidden="true" />
      </button>

      <div className="max-w-2xl">
        <p className="editorial-label">The visual archive</p>
        <h1 className="mt-2 font-display text-5xl leading-none text-ink sm:text-6xl">Our Sticker Album</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">A collection of our everyday moments, one page at a time.</p>
      </div>

      {total === 0 ? (
        <p className="mt-10 text-center text-[#7a5570]">Add sticker sheets to get started.</p>
      ) : (
        <>
          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="surface relative mx-auto w-full max-w-[38rem] rounded-xl p-2.5 sm:p-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-white">
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={index}
                  custom={dir}
                  initial={{ opacity: 0, x: dir >= 0 ? 60 : -60, rotate: dir >= 0 ? 2 : -2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: dir >= 0 ? -60 : 60, rotate: dir >= 0 ? -2 : 2 }}
                  transition={spring}
                  className="absolute inset-0 grid place-items-center p-2 sm:p-4"
                >
                  {failed[index] ? (
                    <div className="text-center">
                      <ImageOff size={32} className="mx-auto text-muted" aria-hidden="true" />
                      <p className="mt-3 text-sm font-semibold text-muted">
                        couldn’t load this page
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        play('pop')
                        setZoom(true)
                      }}
                      className="relative h-full w-full cursor-zoom-in"
                      aria-label={`Zoom ${page.title}`}
                    >
                      {!loaded[index] && <span className="skeleton absolute inset-0 rounded-2xl" />}
                      <img
                        src={pageUrl(page.file)}
                        alt={page.title}
                        loading="eager"
                        onLoad={() => setLoaded((state) => ({ ...state, [index]: true }))}
                        onError={() => setFailed((state) => ({ ...state, [index]: true }))}
                        className={`h-full w-full object-contain transition-opacity duration-300 ${
                          loaded[index] ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <span className="icon-button absolute bottom-3 right-3 bg-white" aria-hidden="true">
                        <Maximize2 size={17} />
                      </span>
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>

              <NavButton dir="prev" onClick={() => go(index - 1)} disabled={total < 2} />
              <NavButton dir="next" onClick={() => go(index + 1)} disabled={total < 2} />
            </div>
          </div>

          <aside className="border-t border-[#e4dde0] pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="editorial-label">Page {index + 1} of {total}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink">{page.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{page.caption}</p>

            <div className="mt-8 grid gap-1">
              {pages.map((item, pageIndex) => (
                <button
                  key={item.file}
                  onClick={() => {
                    if (pageIndex === index) return
                    play('flip')
                    setDir(pageIndex > index ? 1 : -1)
                    setIndex(pageIndex)
                  }}
                  aria-current={pageIndex === index ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                    pageIndex === index ? 'bg-blush/65 font-semibold text-wine' : 'text-muted hover:bg-white hover:text-ink'
                  }`}
                >
                  <span className="mr-3 inline-block w-5 text-xs tabular-nums">{String(pageIndex + 1).padStart(2, '0')}</span>
                  {item.title}
                </button>
              ))}
            </div>
          </aside>
          </div>
        </>
      )}

      {zoom && page && !failed[index] && (
        <div
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${page.title} enlarged`}
          tabIndex={-1}
          onClick={() => setZoom(false)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setZoom(false)
          }}
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 outline-none backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.8, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={spring}
            onClick={(event) => event.stopPropagation()}
            className="surface relative flex max-h-[90vh] w-full max-w-2xl flex-col items-center gap-4 rounded-xl p-5 shadow-soft sm:p-8"
          >
            <button
              onClick={() => setZoom(false)}
              aria-label="Close enlarged sticker page"
              className="icon-button absolute right-3 top-3 bg-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <img
              src={pageUrl(page.file)}
              alt={page.title}
              className="max-h-[68vh] max-w-full rounded-lg bg-white object-contain shadow-soft"
            />
            <h3 className="font-display text-2xl text-ink">{page.title}</h3>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function NavButton({ dir, onClick, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
      className={`icon-button absolute top-1/2 z-10 -translate-y-1/2 bg-white shadow-soft disabled:hidden ${
        dir === 'prev' ? 'left-2 sm:left-3' : 'right-2 sm:right-3'
      }`}
    >
      {dir === 'prev' ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}
    </motion.button>
  )
}

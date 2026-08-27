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
  const [zoomSticker, setZoomSticker] = useState(null)
  const [failed, setFailed] = useState({})
  const [loaded, setLoaded] = useState({})
  const zoomRef = useRef(null)

  const page = pages[index]
  const total = pages.length
  const galleryHeight = page?.stickers.length > 12
    ? 'min-h-[34rem] sm:min-h-[60rem]'
    : page?.stickers.length > 6
      ? 'min-h-[24rem] sm:min-h-[38rem]'
      : 'min-h-[18rem] sm:min-h-[26rem]'

  useEffect(() => {
    if (!zoomSticker) return
    zoomRef.current?.focus()
  }, [zoomSticker])

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
            <div className={`relative overflow-hidden rounded-lg bg-[#fffdf9] p-4 sm:p-6 ${galleryHeight}`}>
              <AnimatePresence mode="popLayout" custom={dir}>
                <motion.div
                  key={index}
                  custom={dir}
                  initial={{ opacity: 0, x: dir >= 0 ? 60 : -60, rotate: dir >= 0 ? 2 : -2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: dir >= 0 ? -60 : 60, rotate: dir >= 0 ? -2 : 2 }}
                  transition={spring}
                  className="absolute inset-0 grid grid-cols-3 content-center gap-3 p-4 sm:gap-4 sm:p-6"
                >
                  {page.stickers.map((sticker, stickerIndex) => (
                    <button
                      key={sticker.id}
                      onClick={() => {
                        play('pop')
                        setZoomSticker({ ...sticker, index: stickerIndex })
                      }}
                      className="group relative grid aspect-square min-h-0 place-items-center overflow-hidden rounded-lg border border-[#e4dde0] bg-white/75 p-2 transition hover:border-wine/35 hover:bg-white"
                      aria-label={`Open ${sticker.label}`}
                    >
                      {!loaded[sticker.id] && !failed[sticker.id] && (
                        <span className="skeleton absolute inset-0" />
                      )}
                      {failed[sticker.id] ? (
                        <ImageOff size={24} className="text-muted" aria-hidden="true" />
                      ) : (
                      <img
                        src={pageUrl(sticker.file)}
                        alt=""
                        loading="lazy"
                        onLoad={() => setLoaded((state) => ({ ...state, [sticker.id]: true }))}
                        onError={() => setFailed((state) => ({ ...state, [sticker.id]: true }))}
                        className={`h-full w-full object-contain transition duration-300 group-hover:scale-[1.04] ${
                          loaded[sticker.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      )}
                      <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg border border-[#e4dde0] bg-white/90 text-wine opacity-0 transition group-hover:opacity-100" aria-hidden="true">
                        <Maximize2 size={14} />
                      </span>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>

              <NavButton key="previous-page" dir="prev" onClick={() => go(index - 1)} disabled={total < 2} />
              <NavButton key="next-page" dir="next" onClick={() => go(index + 1)} disabled={total < 2} />
            </div>
          </div>

          <aside className="border-t border-[#e4dde0] pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="editorial-label">Page {index + 1} of {total}</p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink">{page.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{page.caption}</p>
            <p className="mt-2 text-xs font-semibold uppercase text-sage" style={{ letterSpacing: '0.1em' }}>
              {page.stickers.length} individual stickers
            </p>

            <div className="mt-8 grid gap-1">
              {pages.map((item, pageIndex) => (
                <button
                  key={item.key}
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

      {zoomSticker && (
        <div
          ref={zoomRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomSticker.label} enlarged`}
          tabIndex={-1}
          onClick={() => setZoomSticker(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setZoomSticker(null)
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
              onClick={() => setZoomSticker(null)}
              aria-label="Close enlarged sticker page"
              className="icon-button absolute right-3 top-3 bg-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <img
              src={pageUrl(zoomSticker.file)}
              alt={zoomSticker.label}
              className="max-h-[68vh] max-w-full object-contain"
            />
            <div className="text-center">
              <p className="editorial-label">{page.title}</p>
              <h3 className="mt-1 font-display text-2xl text-ink">
                Sticker {zoomSticker.index + 1} of {page.stickers.length}
              </h3>
            </div>
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

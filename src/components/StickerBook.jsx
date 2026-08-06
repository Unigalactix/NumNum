import { useState } from 'react'
import { motion } from 'framer-motion'
import { content } from '../content'
import { useSound } from '../hooks/useSound'
import { useStickerSheet } from '../hooks/useStickerSheet'
import { spriteCellStyle } from '../lib/sprite'

export default function StickerBook({ onClose }) {
  const play = useSound()
  const [zoom, setZoom] = useState(null)
  const { sheet, sheetUrl, sheetOk } = useStickerSheet()

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-16">
      <button
        onClick={() => {
          play('click')
          onClose()
        }}
        className="btn-ghost mb-6"
      >
        ← back
      </button>

      <div className="text-center">
        <h2 className="gradient-text font-script text-4xl sm:text-5xl">Our Sticker Book</h2>
        <p className="mt-2 text-[#7a5570]">
          all our silly little moments, one sticker at a time 💗
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {content.stickers.map((s, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 14 }}
            whileHover={{ scale: 1.06, rotate: i % 2 ? 3 : -3 }}
            onClick={() => {
              if (!sheetOk) return
              play('pop')
              setZoom(s)
            }}
            className="glass flex flex-col items-center gap-2 rounded-3xl p-4 shadow-soft"
          >
            <div className="grid h-32 w-full place-items-center overflow-hidden rounded-2xl bg-white">
              {sheetOk ? (
                <div
                  className="h-full w-full"
                  style={spriteCellStyle(sheetUrl, sheet, s.r, s.c)}
                />
              ) : (
                <div className="text-center">
                  <div className="text-5xl">{s.emoji}</div>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-rose/60">
                    add sheet.png
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-[#6b4560]">{s.caption}</p>
          </motion.button>
        ))}
      </div>

      {zoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-rose/30 p-8 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div
              className="h-[60vh] w-[60vh] max-h-[80vw] max-w-[80vw] rounded-3xl bg-white shadow-2xl"
              style={spriteCellStyle(sheetUrl, sheet, zoom.r, zoom.c)}
            />
            <p className="font-script text-2xl text-white drop-shadow">{zoom.caption}</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

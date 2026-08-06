// Two fixed, non-interactive layers that add depth:
//  - a faint film grain to kill gradient banding (premium "paper" feel)
//  - a soft vignette to focus the eye toward the center
const NOISE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)'/></svg>",
  )

export default function GrainOverlay() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `url("${NOISE}")`,
          backgroundSize: '160px 160px',
          opacity: 0.04,
          mixBlendMode: 'multiply',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(120,70,110,0.10) 100%)',
        }}
      />
    </>
  )
}

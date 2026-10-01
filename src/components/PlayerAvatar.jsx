import { Bot, UserRound } from 'lucide-react'

const PORTRAITS = {
  rajesh: { file: 'sheet1-09.png', viewBox: '16 14 94 100', width: 207, height: 202 },
  neha: { file: 'sheet5-04.png', viewBox: '24 12 110 115', width: 144, height: 233 },
}

// Crop the existing album stickers in SVG so the same portrait works on boards and in HTML.
export default function PlayerAvatar({ player, size = 40, x, y, className = '', decorative = false }) {
  const portrait = PORTRAITS[player.id]
  const Icon = player.isBot ? Bot : UserRound
  return <svg
    x={x} y={y} width={size} height={size} viewBox="0 0 40 40"
    className={`shrink-0 ${className}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}
    role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : player.name}
    aria-hidden={decorative || undefined} focusable="false"
  >
    <rect x="1" y="1" width="38" height="38" rx="10" fill="#fffefa" stroke={player.color || '#71867a'} strokeWidth="2" />
    {portrait
      ? <svg x="3" y="3" width="34" height="34" viewBox={portrait.viewBox} overflow="hidden">
        <image href={`${import.meta.env.BASE_URL}assets/stickers/individual/${portrait.file}`} width={portrait.width} height={portrait.height} />
      </svg>
      : <Icon x="9" y="9" width="22" height="22" color={player.color || '#71867a'} />}
  </svg>
}

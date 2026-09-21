import { useState } from 'react'
import { ArrowRightLeft, Layers, Shield, Route, Wheat, Hand, Trophy } from 'lucide-react'
import { CARD_NAMES, COSTS, RESOURCES, actor, affordable, cardsTotal, playableCards } from './catanRules'
import { RESOURCE_LABELS, ResourceSticker } from './CatanArtwork'

const CARD_ICONS = { knight: Shield, roads: Route, plenty: Wheat, monopoly: Hand, victory: Trophy }
const empty = () => Object.fromEntries(RESOURCES.map(resource => [resource, 0]))

function ResourceAmounts({ label, value, setValue, maximum }) {
  return <fieldset className="min-w-0"><legend className="mb-2 text-sm font-semibold">{label}</legend><div className="grid grid-cols-5 gap-2">{RESOURCES.map(resource => <label key={resource} className="flex min-w-0 flex-col items-center gap-1" title={RESOURCE_LABELS[resource]}><ResourceSticker resource={resource} width="34" height="34" /><input type="number" min="0" max={maximum[resource]} step="1" value={value[resource]} aria-label={`${label} ${RESOURCE_LABELS[resource]}`} className="w-full min-w-0 rounded border px-1 py-2 text-center" onChange={event => setValue({ ...value, [resource]: Math.max(0, Math.min(maximum[resource], Number(event.target.value) || 0)) })} /></label>)}</div></fieldset>
}

export default function CatanChoices({ match, send }) {
  const [selection, setSelection] = useState(empty)
  const [give, setGive] = useState(empty)
  const [take, setTake] = useState(empty)
  const [target, setTarget] = useState(match.players.findIndex((_, index) => index !== match.current))
  const owner = actor(match)
  const hand = match.hands[owner]
  if (match.phase === 'discard' || match.phase === 'plenty') {
    const count = match.phase === 'discard' ? match.discards[0].count : Math.min(2, cardsTotal(match.bank))
    const maximum = match.phase === 'discard' ? hand : match.bank
    return <div className="my-5 border-y py-5"><ResourceAmounts label={`${match.phase === 'discard' ? 'Discard' : 'Choose'} ${count} cards`} value={selection} setValue={setSelection} maximum={maximum} /><button className="btn mt-4" disabled={cardsTotal(selection) !== count} onClick={() => send({ type: match.phase, cards: selection })}>Confirm selection</button></div>
  }
  if (match.phase === 'victim') return <div className="my-5"><h3 className="font-display text-xl">Steal from</h3><div className="mt-3 flex flex-wrap gap-2">{match.victims.map(player => <button key={player} className="btn-ghost" onClick={() => send({ type: 'steal', target: player })}>{match.players[player].name}</button>)}</div></div>
  if (match.phase === 'monopoly') return <div className="my-5 flex gap-2">{RESOURCES.map(resource => <button className="btn-ghost px-2" key={resource} title={RESOURCE_LABELS[resource]} aria-label={`Collect all ${RESOURCE_LABELS[resource]}`} onClick={() => send({ type: 'monopoly', resource })}><ResourceSticker resource={resource} width="36" height="36" /></button>)}</div>
  if (match.phase === 'offer') return <section className="my-5 border-y py-5"><h3 className="font-display text-xl">Trade with {match.players[match.current].name}</h3>{[['Receive', match.offer.give], ['Give', match.offer.take]].map(([label, cards]) => <div key={label} className="mt-3 flex items-center gap-3"><span>{label}</span>{RESOURCES.filter(resource => cards[resource]).map(resource => <span key={resource} className="flex items-center"><ResourceSticker resource={resource} width="32" height="32" />{cards[resource]}</span>)}</div>)}<div className="mt-4 flex gap-3"><button className="btn" disabled={RESOURCES.some(resource => (match.offer.take[resource] || 0) > hand[resource])} onClick={() => send({ type: 'respond', accept: true })}>Accept trade</button><button className="btn-ghost" onClick={() => send({ type: 'respond', accept: false })}>Decline</button></div></section>
  if (!['roll', 'build'].includes(match.phase)) return null
  const playable = playableCards(match)
  return <section className="mt-6 border-t pt-5">
    <h3 className="catan-eyebrow">Development cards</h3>
    <div className="mt-3 flex flex-wrap gap-2">{match.development[owner].map((card, index) => {
      const Icon = CARD_ICONS[card.type]
      return <button key={index} className="btn-ghost" title={CARD_NAMES[card.type]} disabled={!playable.includes(index)} onClick={() => send({ type: 'playDevelopment', index })}><Icon size={18} />{CARD_NAMES[card.type]}</button>
    })}<button className="btn-ghost" disabled={match.phase !== 'build' || !match.deck.length || !affordable(hand, 'development')} onClick={() => send({ type: 'buyDevelopment' })}><Layers size={18} />Buy card{Object.keys(COSTS.development).map(resource => <ResourceSticker key={resource} resource={resource} width="22" height="22" />)}</button></div>
    {match.phase === 'build' && <details className="mt-5"><summary className="cursor-pointer font-semibold">Player trade</summary><div className="mt-4 grid gap-4"><label className="text-sm">Partner <select aria-label="Trade partner" value={target} onChange={event => setTarget(Number(event.target.value))} className="ml-3 rounded border p-2">{match.players.map((player,index) => index !== match.current && <option key={player.id} value={index}>{player.name}</option>)}</select></label><ResourceAmounts label="Offer" value={give} setValue={setGive} maximum={hand} /><ResourceAmounts label="Request" value={take} setValue={setTake} maximum={Object.fromEntries(RESOURCES.map(resource => [resource,19]))} /><button className="btn-ghost justify-self-start" disabled={!cardsTotal(give) || !cardsTotal(take) || RESOURCES.some(resource => give[resource] && take[resource])} onClick={() => send({ type: 'offer', target, give, take })}><ArrowRightLeft size={18} />Offer trade</button></div></details>}
  </section>
}
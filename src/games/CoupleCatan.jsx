import { useEffect, useState } from 'react'
import { ArrowRight, ArrowRightLeft, Bot, Building2, Dice5, Flag, House, Route, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import CoupleGameSetup from './CoupleGameSetup'
import Modal from '../components/Modal'
import { BOARD, COSTS, RESOURCES, act, affordable, botAction, citySites, newMatch, roadSites, score, settlementSites, tradeRate } from './catanBoard'
import { BuildingSticker, RESOURCE_LABELS, ResourceSticker, TERRAIN_COLORS } from './CatanArtwork'
import './catan.css'

const BUILD_OPTIONS = [{ type: 'road', Icon: Route }, { type: 'settlement', Icon: House }, { type: 'city', Icon: Building2 }]
const DIE_PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]]

function Die({ value }) {
  return <span className="catan-die" aria-label={value ? `Die: ${value}` : 'Not rolled'}>{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ opacity: DIE_PIPS[value || 0].includes(index) ? 1 : 0 }} />)}</span>
}

function Island({ match, action, send, zoom }) {
  const active = match.players[match.current]
  const human = !active.isBot && match.winner === null
  const availableEdges = human && action === 'road' && match.phase === 'build' && affordable(match.hands[match.current], 'road') ? roadSites(match, match.current) : []
  const availableVertices = human && match.phase === 'build' && action !== 'road' && action && affordable(match.hands[match.current], action)
    ? action === 'city' ? citySites(match, match.current) : settlementSites(match, match.current) : []
  const keyActivate = (event, callback) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback() }
  }
  return <div className="catan-map-scroll" tabIndex={0} aria-label="Island board, scroll when zoomed">
    <svg className="catan-map" viewBox="0 0 700 620" style={{ width: `${zoom * 100}%` }} role="group" aria-label="Catan island: 19 hexes, roads, settlements and ports">
      <defs>
        <pattern id="catan-waves" width="52" height="28" patternUnits="userSpaceOnUse"><path d="M8 14q8 6 16 0t16 0" fill="none" stroke="#ffffff" strokeOpacity=".2" strokeWidth="1.5" /></pattern>
        <pattern id="catan-fields" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12 12 0" stroke="#ffffff" strokeOpacity=".15" /></pattern>
      </defs>
      <path fill="#a8d0d5" d="M0 0h700v620H0Z" />
      <path fill="url(#catan-waves)" d="M0 0h700v620H0Z" />
      {BOARD.tiles.map((tile) => <polygon key={`shore-${tile.id}`} points={tile.corners.map((corner) => `${BOARD.vertices[corner].x},${BOARD.vertices[corner].y}`).join(' ')} fill="#e9dcbf" stroke="#e9dcbf" strokeWidth="17" strokeLinejoin="round" />)}
      {BOARD.ports.map((port) => {
        const ends = port.ends.map((end) => BOARD.vertices[end])
        const middle = { x: (ends[0].x + ends[1].x) / 2, y: (ends[0].y + ends[1].y) / 2 }
        const distance = Math.hypot(middle.x - 350, middle.y - 310)
        const point = { x: middle.x + (middle.x - 350) * 49 / distance, y: middle.y + (middle.y - 310) * 49 / distance }
        return <g key={`port-${port.id}`} aria-label={`${port.resource ? RESOURCE_LABELS[port.resource] : 'Any resource'} port, ${port.resource ? '2' : '3'} to 1`}>
          <title>{port.resource ? RESOURCE_LABELS[port.resource] : 'Any resource'} port: {port.resource ? '2:1' : '3:1'}</title>
          {ends.map((end) => <line key={end.id} x1={end.x} y1={end.y} x2={point.x} y2={point.y} stroke="#fff8e3" strokeWidth="3" strokeDasharray="5 4" />)}
          <circle cx={point.x} cy={point.y} r="23" fill="#fbfcf4" stroke="#649aa1" strokeWidth="2" />
          {port.resource ? <ResourceSticker resource={port.resource} x={point.x - 14} y={point.y - 22} width="28" height="28" /> : <path d={`M${point.x - 10} ${point.y - 6}h20l-5 6h-11Z M${point.x} ${point.y - 20}v13h10Z`} fill="#65878d" />}
          <text x={point.x} y={point.y + 16} textAnchor="middle" fontSize="13" fontWeight="800" fill="#35555a">{port.resource ? '2:1' : '3:1'}</text>
        </g>
      })}
      {BOARD.tiles.map((tile) => {
        const selectable = human && match.phase === 'robber' && tile.id !== match.robber
        const points = tile.corners.map((corner) => `${BOARD.vertices[corner].x},${BOARD.vertices[corner].y}`).join(' ')
        const hot = tile.number === 6 || tile.number === 8
        return <g key={tile.id} className={selectable ? 'catan-target' : ''} role={selectable ? 'button' : 'img'} tabIndex={selectable ? 0 : undefined}
          aria-label={`${selectable ? 'Move robber to ' : ''}${RESOURCE_LABELS[tile.resource]} hex ${tile.id + 1}${tile.number ? `, roll ${tile.number}` : ''}`}
          onClick={selectable ? () => send({ type: 'robber', id: tile.id }) : undefined}
          onKeyDown={selectable ? (event) => keyActivate(event, () => send({ type: 'robber', id: tile.id })) : undefined}>
          <title>{RESOURCE_LABELS[tile.resource]}{tile.number ? `: ${tile.number}` : ''}</title>
          <polygon points={points} fill={TERRAIN_COLORS[tile.resource]} stroke={selectable ? '#fffdf7' : '#ffffff75'} strokeWidth={selectable ? 3 : 2} />
          <polygon points={points} fill="url(#catan-fields)" />
          <ResourceSticker resource={tile.resource} x={tile.x - 28} y={tile.y - 46} width="56" height="56" />
          {tile.number && <g>
            <circle cx={tile.x} cy={tile.y + 22} r="19" fill="#fff9e9" stroke="#6b645044" strokeWidth="1.5" />
            <text x={tile.x} y={tile.y + 25} textAnchor="middle" fontSize="20" fontWeight="800" fill={hot ? '#bc393d' : '#353635'}>{tile.number}</text>
            {Array.from({ length: 6 - Math.abs(7 - tile.number) }, (_, index) => <circle key={index} cx={tile.x + (index - (5 - Math.abs(7 - tile.number)) / 2) * 5} cy={tile.y + 33} r="1.6" fill={hot ? '#bc393d' : '#555548'} />)}
          </g>}
          {match.robber === tile.id && <g transform={`translate(${tile.x + 24} ${tile.y + 3})`} aria-label="Robber">
            <title>Robber: production blocked</title><path d="M-9 20-5 0Q-12-13 0-14 12-13 5 0l4 20Z" fill="#383b43" stroke="#fffdf7" strokeWidth="2.5" /><path d="M-4 0h8" stroke="#c5c6bf" />
          </g>}
        </g>
      })}
      {BOARD.edges.filter((edge) => match.roads[edge.id] !== undefined).map((edge) => {
        const [start, end] = edge.ends.map((id) => BOARD.vertices[id])
        return <g key={edge.id}><title>{match.players[match.roads[edge.id]].name}'s road</title>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#fff9eb" strokeWidth="10" strokeLinecap="round" />
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={match.players[match.roads[edge.id]].color} strokeWidth="6" strokeLinecap="round" />
        </g>
      })}
      {availableEdges.map((edge) => {
        const [start, end] = edge.ends.map((id) => BOARD.vertices[id])
        return <g key={edge.id} className="catan-target" role="button" tabIndex={0} aria-label={`Build road ${edge.id + 1}`} onClick={() => send({ type: 'road', id: edge.id })} onKeyDown={(event) => keyActivate(event, () => send({ type: 'road', id: edge.id }))}>
          <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="transparent" strokeWidth="22" />
          <line x1={start.x * .8 + end.x * .2} y1={start.y * .8 + end.y * .2} x2={end.x * .8 + start.x * .2} y2={end.y * .8 + start.y * .2} stroke="#fffdf4" strokeWidth="7" strokeDasharray="5 5" />
        </g>
      })}
      {Object.entries(match.buildings).map(([id, building]) => {
        const vertex = BOARD.vertices[id]
        return <g key={id}><title>{match.players[building.owner].name}'s {building.level === 2 ? 'city' : 'settlement'}</title>
          <BuildingSticker x={vertex.x - 16} y={vertex.y - 22} width="32" height="32" city={building.level === 2} color={match.players[building.owner].color} />
        </g>
      })}
      {availableVertices.map((vertex) => <g key={vertex.id} className="catan-target" role="button" tabIndex={0} aria-label={`Build ${action} at corner ${vertex.id + 1}`} onClick={() => send({ type: action, id: vertex.id })} onKeyDown={(event) => keyActivate(event, () => send({ type: action, id: vertex.id }))}>
        <circle cx={vertex.x} cy={vertex.y} r="15" fill="#fffdf4" stroke={active.color} strokeWidth="3" />
        <path d={`M${vertex.x - 5} ${vertex.y}h10M${vertex.x} ${vertex.y - 5}v10`} stroke={active.color} strokeWidth="2" />
      </g>)}
    </svg>
  </div>
}

export default function CoupleCatan() {
  const [match, setMatch] = useState(null)
  const [action, setAction] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [tradeFrom, setTradeFrom] = useState('wood')
  const [tradeTo, setTradeTo] = useState('ore')
  const [restart, setRestart] = useState(false)
  const send = (move) => { setMatch((current) => act(current, move)); setAction(null) }

  useEffect(() => {
    if (!match || match.winner !== null || !match.players[match.current].isBot || restart) return
    const timer = setTimeout(() => setMatch((current) => act(current, botAction(current))), 700)
    return () => clearTimeout(timer)
  }, [match, restart])

  if (!match) return <CoupleGameSetup onStart={(players) => { setMatch(newMatch(players)); setZoom(1); setAction(null) }} />

  const player = match.players[match.current]
  const hand = match.hands[match.current]
  const canAct = !player.isBot && match.winner === null
  const canBuild = canAct && match.phase === 'build'
  const rate = tradeRate(match, match.current, tradeFrom)
  const phaseLabel = match.winner !== null ? `${match.players[match.winner].name} wins` : player.isBot ? `${player.name}'s turn` : match.phase === 'robber' ? 'Move the robber' : match.phase === 'roll' ? `${player.name} to roll` : `${player.name}'s turn`

  return <div className="catan-table">
    <header className="catan-header">
      <div><span className="catan-eyebrow">Our island</span><h2>{phaseLabel}</h2><span className="catan-edition">House edition</span></div>
      <div className="catan-header-actions"><Die value={match.dice?.[0]} /><Die value={match.dice?.[1]} /><button className="icon-button" title="New match" aria-label="New match" onClick={() => setRestart(true)}><RotateCcw size={18} /></button></div>
    </header>
    <div className="catan-layout">
      <div className="catan-island">
        <div className="catan-map-tools"><span className="catan-eyebrow">{action ? `Place ${action}` : 'The island'}</span><div>
          <button className="icon-button" title="Zoom out" aria-label="Zoom out" disabled={zoom === 1} onClick={() => setZoom(Math.max(1, zoom - .5))}><ZoomOut size={18} /></button>
          <button className="icon-button" title="Zoom in" aria-label="Zoom in" disabled={zoom === 2} onClick={() => setZoom(Math.min(2, zoom + .5))}><ZoomIn size={18} /></button>
        </div></div>
        <Island match={match} action={action} send={send} zoom={zoom} />
        <div className="catan-turnbar" aria-live="polite"><span>{match.log[0]}</span>
          {match.winner === null && <button className="btn" disabled={!canAct || match.phase === 'robber'} onClick={() => send({ type: match.phase === 'roll' ? 'roll' : 'end' })}>
            {match.phase === 'roll' ? <Dice5 size={18} /> : <ArrowRight size={18} />}{match.phase === 'roll' ? 'Roll dice' : 'End turn'}
          </button>}
        </div>
      </div>
      <aside className="catan-sidebar" aria-label="Players and turn log">
        <h3 className="catan-eyebrow">At the table</h3>
        {match.players.map((seat, index) => <div className={`catan-player ${index === match.current ? 'catan-player-active' : ''}`} key={seat.id} style={{ '--seat-color': seat.color }}>
          <div className="catan-player-title"><span><i />{seat.name}{seat.isBot && <Bot size={15} />}</span><strong><Flag size={13} />{score(match, index)}<small>/10</small></strong></div>
          <div className="catan-player-resources">{RESOURCES.map((resource) => <span key={resource} title={`${RESOURCE_LABELS[resource]}: ${match.hands[index][resource]}`}><ResourceSticker resource={resource} width="26" height="26" /><b>{match.hands[index][resource]}</b></span>)}</div>
        </div>)}
        <details className="catan-log"><summary>Turn log</summary><ol>{match.log.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol></details>
      </aside>
    </div>
    <section className="catan-hand" aria-label={`${player.name}'s resources`}>
      <div className="catan-section-heading"><h3 className="catan-eyebrow">{player.name}'s hand</h3><span>{Object.values(hand).reduce((total, value) => total + value, 0)} cards</span></div>
      <div className="catan-resource-cards">{RESOURCES.map((resource) => <div key={resource} className="catan-resource-card" style={{ '--terrain': TERRAIN_COLORS[resource] }} title={`${RESOURCE_LABELS[resource]}: ${hand[resource]}`} aria-label={`${hand[resource]} ${RESOURCE_LABELS[resource]}`}>
        <ResourceSticker resource={resource} width="64" height="64" /><strong>{hand[resource]}</strong>
      </div>)}</div>
    </section>
    <section className="catan-actions" aria-label="Build and trade">
      <div><h3 className="catan-eyebrow">Build</h3><div className="catan-build-options">
        {BUILD_OPTIONS.map(({ type, Icon }) => {
          const sites = type === 'road' ? roadSites(match, match.current) : type === 'city' ? citySites(match, match.current) : settlementSites(match, match.current)
          return <button key={type} title={`Build ${type}`} aria-label={`Build ${type}`} aria-pressed={action === type} disabled={!canBuild || !affordable(hand, type) || !sites.length} onClick={() => setAction(action === type ? null : type)}>
            <Icon size={23} /><span className="catan-cost">{Object.entries(COSTS[type]).map(([resource, count]) => <span key={resource}><ResourceSticker resource={resource} width="25" height="25" />{count > 1 && <b>{count}</b>}</span>)}</span>
          </button>
        })}
      </div></div>
      <div className="catan-trade"><h3 className="catan-eyebrow">Bank & harbors</h3>
        {[{ label: `Give ${rate}`, value: tradeFrom, set: setTradeFrom }, { label: 'Receive 1', value: tradeTo, set: setTradeTo }].map((group) => <fieldset key={group.label}><legend>{group.label}</legend><div className="catan-resource-picker">
          {RESOURCES.map((resource) => <label key={resource} title={RESOURCE_LABELS[resource]}><input type="radio" name={group.label.startsWith('Give') ? 'catan-give' : 'catan-receive'} aria-label={`${group.label.startsWith('Give') ? 'Give' : 'Receive'} ${RESOURCE_LABELS[resource]}`} checked={group.value === resource} onChange={() => group.set(resource)} /><ResourceSticker resource={resource} width="32" height="32" /></label>)}
        </div></fieldset>)}
        <button className="btn-ghost" disabled={!canBuild || tradeFrom === tradeTo || hand[tradeFrom] < rate} onClick={() => send({ type: 'trade', from: tradeFrom, to: tradeTo })}><ArrowRightLeft size={17} />Trade {rate}:1</button>
      </div>
    </section>
    <Modal open={restart} onClose={() => setRestart(false)}><h2 className="font-display text-3xl">Start a new match?</h2><p className="mt-3 text-muted">This island's progress will be lost.</p><div className="mt-6 flex gap-3"><button className="btn-ghost" onClick={() => setRestart(false)}>Keep playing</button><button className="btn" onClick={() => { setMatch(null); setRestart(false) }}>New match</button></div></Modal>
  </div>
}
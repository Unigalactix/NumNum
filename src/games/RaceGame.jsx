import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Dice5, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useLocalMatch } from '../hooks/useLocalMatch'
import CoupleGameSetup from './CoupleGameSetup'
import Modal from '../components/Modal'
import { FINISH, JUMPS, LUDO_COLORS, LUDO_LANES, LUDO_TRACK, LUDO_YARDS, ludoCoordinate, ludoMoves, newRace, raceAction, raceBot } from './raceRules'

const squarePoint = (square) => {
  if (!square) return [24, 626]
  const row = Math.floor((square - 1) / 10)
  const column = row % 2 ? 9 - (square - 1) % 10 : (square - 1) % 10
  return [column * 60 + 30, (9 - row) * 60 + 30]
}

function SnakesBoard({ match, reduce }) {
  return <svg viewBox="0 0 600 650" className="mx-auto w-full" aria-label="Snakes and Ladders board" role="group">
    {Array.from({ length: 100 }, (_, index) => {
      const number = index + 1
      const [left, top] = squarePoint(number)
      return <g key={number}><rect x={left-30} y={top-30} width="60" height="60" fill={(Math.floor(index/10)+index%10)%2 ? '#e1ece2' : '#fff5dc'} stroke="#b5c2b3" /><text x={left-24} y={top-13} fontSize="12" fill="#4b5952" fontWeight="700">{number}</text></g>
    })}
    {Object.entries(JUMPS).map(([from, to]) => {
      const [startX, startY] = squarePoint(Number(from))
      const [endX, endY] = squarePoint(to)
      if (to > Number(from)) {
        const length = Math.hypot(endX-startX,endY-startY)
        const angle = Math.atan2(endY-startY,endX-startX)*180/Math.PI
        return <g key={from} transform={`translate(${startX} ${startY}) rotate(${angle})`} aria-label={`Ladder ${from} to ${to}`}><title>Ladder {from} to {to}</title><path d={`M0 -9H${length}M0 9H${length}`} stroke="#846039" strokeWidth="5" strokeLinecap="round" />{Array.from({length:Math.floor(length/16)},(_,index)=><path key={index} d={`M${index*16+8} -9v18`} stroke="#ad8251" strokeWidth="4" />)}</g>
      }
      const middleX=(startX+endX)/2
      const middleY=(startY+endY)/2
      const clampX=value=>Math.max(16,Math.min(584,value))
      const curve=`M${startX} ${startY} C${clampX(startX+65)} ${startY+35} ${clampX(middleX-70)} ${middleY-30} ${middleX} ${middleY} C${clampX(middleX+70)} ${middleY+30} ${clampX(endX+45)} ${endY-25} ${endX} ${endY}`
      return <g key={from} aria-label={`Snake ${from} to ${to}`}><title>Snake {from} to {to}</title><path d={curve} fill="none" stroke="#fffdf7" strokeWidth="16" strokeLinecap="round" /><path d={curve} fill="none" stroke={Number(from)%2 ? '#986087' : '#418c89'} strokeWidth="12" strokeLinecap="round" /><path d={curve} fill="none" stroke="#ffffff66" strokeWidth="3" strokeDasharray="3 12" /><ellipse cx={startX} cy={startY} rx="13" ry="10" fill={Number(from)%2 ? '#986087' : '#418c89'} /><circle cx={startX-4} cy={startY-3} r="2" fill="white" /><circle cx={startX+4} cy={startY-3} r="2" fill="white" /></g>
    })}
    <text x="12" y="640" fontSize="12" fill="#746c71">START</text>
    {match.players.map((player, owner) => {
      const [left, top] = squarePoint(match.positions[owner])
      const offsetX=owner%2*17-8
      const offsetY=Math.floor(owner/2)*17-5
      const path=match.moved===owner && match.path.length && !reduce ? match.path.map(squarePoint) : [[left,top]]
      return <motion.g key={player.id} initial={false} animate={{ x:path.map(point=>point[0]+offsetX), y:path.map(point=>point[1]+offsetY) }} transition={{duration:reduce?0:Math.min(1.2,path.length*.15)}}>
        <title>{player.name}: {match.positions[owner]}</title><circle r="10" fill={player.color} stroke="white" strokeWidth="2" /><text textAnchor="middle" y="4" fontSize="10" fontWeight="800" fill="white">{owner+1}</text>
      </motion.g>
    })}
  </svg>
}

function LudoBoard({ match, send, disabled, reduce }) {
  const legal = disabled ? [] : ludoMoves(match)
  return <svg viewBox="0 0 600 600" className="mx-auto w-full" role="group" aria-label="Classic Ludo board">
    <rect width="600" height="600" rx="8" fill="#fffefa" />
    {LUDO_YARDS.map(([row,column],seat)=><g key={seat}><rect x={column*40} y={row*40} width="240" height="240" fill={LUDO_COLORS[seat]} /><rect x={column*40+35} y={row*40+35} width="170" height="170" rx="8" fill="#fffefa" />{[0,1,2,3].map(piece=><circle key={piece} cx={(column+2+piece%2*2)*40+20} cy={(row+2+Math.floor(piece/2)*2)*40+20} r="18" fill={LUDO_COLORS[seat]} opacity=".2" />)}</g>)}
    {LUDO_TRACK.map(([row,column],index)=><rect key={index} x={column*40} y={row*40} width="40" height="40" fill={index%13===0?LUDO_COLORS[index/13]:'#fffefa'} stroke="#8f9791" />)}
    {LUDO_LANES.map((lane,seat)=><g key={seat}>{lane.slice(0,5).map(([row,column])=><rect key={`${row}-${column}`} x={column*40} y={row*40} width="40" height="40" fill={LUDO_COLORS[seat]} stroke="#fffefa" />)}</g>)}
    {['240,240 300,300 240,360','240,240 360,240 300,300','360,240 360,360 300,300','240,360 300,300 360,360'].map((points,seat)=><polygon key={seat} points={points} fill={LUDO_COLORS[seat]} />)}
    {match.players.flatMap((player,owner)=>match.pieces[owner].map((progress,piece)=>{
      const [row,column]=ludoCoordinate(match,owner,piece)
      const stacked=match.pieces[owner].filter(value=>value===progress).length>1 && progress>=0
      const offset=stacked ? [(piece%2)*14-7, Math.floor(piece/2)*14-7] : [0,0]
      const selectable=owner===match.current && legal.includes(piece)
      return <motion.g key={`${player.id}-${piece}`} initial={false} animate={{x:column*40+20+offset[0],y:row*40+20+offset[1]}} transition={{duration:reduce?0:.25}} role="button" tabIndex={selectable?0:-1} aria-disabled={!selectable} aria-label={`${player.name} token ${piece+1}, ${progress<0?'yard':progress===FINISH?'finished':progress>50?'home lane':'track'}`} onClick={()=>selectable&&send({type:'move',piece})} onKeyDown={event=>{if(selectable&&(event.key==='Enter'||event.key===' ')){event.preventDefault();send({type:'move',piece})}}} style={{cursor:selectable?'pointer':'default'}}>
        {selectable&&<circle r="19" fill="#fff" stroke="#272126" strokeWidth="2" strokeDasharray="3 2" />}<circle r={stacked?10:14} fill={player.color} stroke="#fff" strokeWidth="3" /><text y="4" textAnchor="middle" fontSize="11" fontWeight="800" fill="white">{piece+1}</text>
      </motion.g>
    }))}
  </svg>
}

export default function RaceGame({ game }) {
  const [match,setMatch]=useLocalMatch(game,null,2)
  const [restart,setRestart]=useState(false)
  const [busy,setBusy]=useState(false)
  const [zoom,setZoom]=useState(1)
  const reduce=useReducedMotion()
  const send=(action)=>{
    if(busy||restart)return
    setMatch(current=>raceAction(current,action))
    setBusy(true)
  }
  useEffect(()=>{if(!busy)return;const timer=setTimeout(()=>setBusy(false),reduce?30:game==='snakes'?1250:300);return()=>clearTimeout(timer)},[busy,reduce,game])
  useEffect(()=>{
    if(!match||match.winner!==null||!match.players[match.current].isBot||busy||restart)return
    const timer=setTimeout(()=>send(raceBot(match)),650)
    return()=>clearTimeout(timer)
  },[match,busy,restart])
  if(!match)return <CoupleGameSetup onStart={players=>setMatch(newRace(players,game))} />
  const player=match.players[match.current]
  return <div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="editorial-label">{game==='ludo'?'Classic rules':'Exact finish'}</p><h2 className="font-display text-2xl" style={{color:player.color}}>{match.winner!==null?`${match.players[match.winner].name} wins!`:`${player.name}'s turn`}</h2></div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-lg border text-2xl" aria-label={`Die ${match.lastRoll||match.die||'not rolled'}`}>{match.lastRoll||match.die||'-'}</span><button className="icon-button" title="New match" aria-label="New match" onClick={()=>setRestart(true)}><RotateCcw size={18} /></button></div></div>
    <div className="mb-3 flex justify-end gap-2"><button className="icon-button" aria-label="Zoom out" title="Zoom out" disabled={zoom===1} onClick={()=>setZoom(Math.max(1,zoom-.5))}><ZoomOut size={18}/></button><button className="icon-button" aria-label="Zoom in" title="Zoom in" disabled={zoom===3} onClick={()=>setZoom(Math.min(3,zoom+.5))}><ZoomIn size={18}/></button></div>
    <div className="mx-auto max-h-[75vh] max-w-2xl overflow-auto rounded-lg border" tabIndex={0} aria-label="Scrollable game board"><div style={{width:`${zoom*100}%`}}>{game==='ludo'?<LudoBoard match={match} send={send} disabled={busy||player.isBot||restart} reduce={reduce}/>:<SnakesBoard match={match} reduce={reduce}/>}</div></div>
    <div className="mt-4 flex flex-wrap justify-center gap-4">{match.players.map((seat,index)=><span className="text-sm font-semibold" key={seat.id} style={{color:seat.color}}>{seat.name}: {game==='ludo'?`${match.pieces[index].filter(value=>value===FINISH).length}/4 home`:match.positions[index]}</span>)}</div>
    <p role="status" className="my-4 min-h-6 text-center text-sm text-muted">{match.log}</p>
    <div className="flex justify-center"><button className="btn" disabled={busy||player.isBot||match.winner!==null||(game==='ludo'&&!!match.die)} onClick={()=>send({type:'roll'})}><Dice5 size={18}/>Roll die</button></div>
    <Modal open={restart} onClose={()=>setRestart(false)}><h2 className="font-display text-2xl">Start a new match?</h2><div className="mt-5 flex gap-3"><button className="btn-ghost" onClick={()=>setRestart(false)}>Keep playing</button><button className="btn" onClick={()=>{setMatch(null);setBusy(false);setRestart(false);setZoom(1)}}>New match</button></div></Modal>
  </div>
}
import { BOARD, COSTS as BUILD_COSTS, RESOURCES, citySites, roadSites, settlementSites, tradeRate } from './catanBoard.js'
export { BOARD, RESOURCES, citySites, roadSites, settlementSites, tradeRate }
export const COSTS = { ...BUILD_COSTS, development: { sheep: 1, wheat: 1, ore: 1 } }
export const CARD_NAMES = { knight: 'Knight', roads: 'Road building', plenty: 'Year of plenty', monopoly: 'Monopoly', victory: 'Victory point' }
export const cardsTotal = (hand) => Object.values(hand).reduce((total, count) => total + count, 0)
const resources = (count = 0) => Object.fromEntries(RESOURCES.map((resource) => [resource, count]))
export const affordable = (hand, type) => Object.entries(COSTS[type]).every(([resource, count]) => hand[resource] >= count)
export const actor = (match) => match.phase === 'discard' ? match.discards[0].owner : match.phase === 'offer' ? match.offer.target : match.current

function shuffle(values, random) {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

export function newMatch(players, random = Math.random) {
  if (players.length < 3 || players.length > 4) throw new Error('Base Catan requires 3 or 4 seats')
  const first = Math.floor(random() * players.length)
  const order = players.map((_, index) => (first + index) % players.length)
  return {
    players, current: first, phase: 'setupSettlement', setupOrder: [...order, ...[...order].reverse()], setupIndex: 0, setupVertex: null,
    dice: null, robber: 9, buildings: {}, roads: {}, hands: players.map(() => resources()), bank: resources(19),
    development: players.map(() => []), deck: shuffle([...Array(14).fill('knight'), ...Array(5).fill('victory'), ...Array(2).fill('roads'), ...Array(2).fill('plenty'), ...Array(2).fill('monopoly')], random),
    knights: players.map(() => 0), longest: null, largest: null, discards: [], victims: [], offer: null, freeRoads: 0,
    resumePhase: null, playedDevelopment: false, turn: 0, revision: 0, winner: null, log: [`${players[first].name}: place a settlement.`],
  }
}

export function longestRoad(match, owner) {
  const walk = (vertex, used) => {
    if (used.size && match.buildings[vertex] && match.buildings[vertex].owner !== owner) return used.size
    let best = used.size
    for (const edgeId of BOARD.vertices[vertex].edges) {
      if (match.roads[edgeId] !== owner || used.has(edgeId)) continue
      const edge = BOARD.edges[edgeId]
      const end = edge.ends.find((id) => id !== vertex)
      best = Math.max(best, walk(end, new Set([...used, edgeId])))
    }
    return best
  }
  return Math.max(0, ...BOARD.vertices.map((vertex) => walk(vertex.id, new Set())))
}

function award(values, previous, minimum) {
  const highest = Math.max(...values)
  if (highest < minimum) return null
  const leaders = values.flatMap((value, index) => value === highest ? [index] : [])
  if (leaders.includes(previous)) return previous
  return leaders.length === 1 ? leaders[0] : null
}

export function score(match, owner, hidden = true) {
  const buildings = Object.values(match.buildings).filter((building) => building.owner === owner).reduce((total, building) => total + building.level, 0)
  return buildings + (match.longest === owner ? 2 : 0) + (match.largest === owner ? 2 : 0) + (hidden ? match.development[owner].filter((card) => card.type === 'victory').length : 0)
}

function resolveAwards(match) {
  match.longest = award(match.players.map((_, owner) => longestRoad(match, owner)), match.longest, 5)
  match.largest = award(match.knights, match.largest, 3)
  if (!match.phase.startsWith('setup') && score(match, match.current) >= 10) match.winner = match.current
}

export function buildSites(match, type) {
  if (match.phase === 'setupSettlement') return type === 'settlement' ? settlementSites(match, match.current, true) : []
  if (match.phase === 'setupRoad') return type === 'road' ? BOARD.edges.filter((edge) => edge.ends.includes(match.setupVertex) && match.roads[edge.id] === undefined) : []
  if (match.phase === 'freeRoads') return type === 'road' ? roadSites(match, match.current) : []
  if (match.phase !== 'build' || !affordable(match.hands[match.current], type)) return []
  return type === 'road' ? roadSites(match, match.current) : type === 'city' ? citySites(match, match.current) : settlementSites(match, match.current)
}

function pay(match, owner, type) {
  for (const [resource, count] of Object.entries(COSTS[type])) { match.hands[owner][resource] -= count; match.bank[resource] += count }
}

function validSelection(selection, total, available) {
  if (!selection || Object.keys(selection).some((resource) => !RESOURCES.includes(resource))) return false
  return RESOURCES.every((resource) => Number.isInteger(selection[resource] || 0) && (selection[resource] || 0) >= 0 && (selection[resource] || 0) <= available[resource]) && cardsTotal(selection) === total
}

function receive(match, owner, selection) {
  for (const [resource, count] of Object.entries(selection)) { match.bank[resource] -= count; match.hands[owner][resource] += count }
}

export function playableCards(match) {
  if (match.playedDevelopment || !['roll','build'].includes(match.phase)) return []
  return match.development[match.current].flatMap((card, index) => {
    if (card.type === 'victory' || card.bought >= match.turn) return []
    if (card.type === 'roads' && !roadSites(match, match.current).length) return []
    if (card.type === 'plenty' && cardsTotal(match.bank) === 0) return []
    return [index]
  })
}

export function act(match, action, random = Math.random) {
  if (!match || match.winner !== null) return match
  if (action.actor !== undefined && action.actor !== actor(match)) return match
  const next = structuredClone(match)
  const owner = next.current
  const hand = next.hands[owner]
  const name = next.players[owner].name
  let message
  if (['road','settlement','city'].includes(action.type)) {
    if (!buildSites(next, action.type).some((site) => site.id === action.id)) return match
    const phase = next.phase
    if (phase === 'build') pay(next, owner, action.type)
    if (action.type === 'road') next.roads[action.id] = owner
    else next.buildings[action.id] = { owner, level: action.type === 'city' ? 2 : 1 }
    if (phase === 'setupSettlement') {
      next.setupVertex = action.id
      next.phase = 'setupRoad'
      if (next.setupIndex >= next.players.length) for (const tileId of BOARD.vertices[action.id].tiles) {
        const resource = BOARD.tiles[tileId].resource
        if (resource !== 'desert' && next.bank[resource]) receive(next, owner, { [resource]: 1 })
      }
    } else if (phase === 'setupRoad') {
      next.setupIndex++
      next.setupVertex = null
      if (next.setupIndex === next.setupOrder.length) { next.phase = 'roll'; next.current = next.setupOrder[0] }
      else { next.current = next.setupOrder[next.setupIndex]; next.phase = 'setupSettlement' }
    } else if (phase === 'freeRoads') {
      next.freeRoads--
      if (!next.freeRoads || !roadSites(next, owner).length) next.phase = next.resumePhase
    }
    message = `${name} built a ${action.type}.`
  } else if (action.type === 'roll' && next.phase === 'roll') {
    next.dice = [Math.floor(random()*6)+1, Math.floor(random()*6)+1]
    const sum = next.dice[0]+next.dice[1]
    if (sum === 7) {
      next.discards = next.hands.flatMap((cards, player) => cardsTotal(cards)>7 ? [{owner:player,count:Math.floor(cardsTotal(cards)/2)}] : [])
      next.phase = next.discards.length ? 'discard' : 'robber'
      next.resumePhase = 'build'
    } else {
      const production = next.players.map(() => resources())
      BOARD.tiles.filter((tile)=>tile.number===sum&&tile.id!==next.robber).forEach((tile)=>tile.corners.forEach((corner)=>{
        const building=next.buildings[corner]
        if(building)production[building.owner][tile.resource]+=building.level
      }))
      for(const resource of RESOURCES){
        const entitled=production.flatMap((cards,player)=>cards[resource]?[player]:[])
        const demand=production.reduce((total,cards)=>total+cards[resource],0)
        if(demand<=next.bank[resource]) entitled.forEach(player=>receive(next,player,{[resource]:production[player][resource]}))
        else if(entitled.length===1) receive(next,entitled[0],{[resource]:next.bank[resource]})
      }
      next.phase='build'
    }
    message=`${name} rolled ${sum}.`
  } else if(action.type==='discard'&&next.phase==='discard'){
    const required=next.discards[0]
    if(!validSelection(action.cards,required.count,next.hands[required.owner]))return match
    for(const [resource,count] of Object.entries(action.cards)){next.hands[required.owner][resource]-=count;next.bank[resource]+=count}
    next.discards.shift()
    if(!next.discards.length)next.phase='robber'
    message=`${next.players[required.owner].name} discarded ${required.count} cards.`
  } else if(action.type==='robber'&&next.phase==='robber'&&BOARD.tiles[action.id]&&action.id!==next.robber){
    next.robber=action.id
    next.victims=[...new Set(BOARD.tiles[action.id].corners.map(corner=>next.buildings[corner]?.owner).filter(player=>player!==undefined&&player!==owner&&cardsTotal(next.hands[player])>0))]
    next.phase=next.victims.length?'victim':next.resumePhase
    message=`${name} moved the robber.`
  } else if(action.type==='steal'&&next.phase==='victim'&&next.victims.includes(action.target)){
    const held=RESOURCES.flatMap(resource=>Array(next.hands[action.target][resource]).fill(resource))
    const resource=held[Math.floor(random()*held.length)]
    next.hands[action.target][resource]--;hand[resource]++
    next.victims=[];next.phase=next.resumePhase
    message=`${name} stole one card from ${next.players[action.target].name}.`
  } else if(action.type==='trade'&&next.phase==='build'&&RESOURCES.includes(action.from)&&RESOURCES.includes(action.to)&&action.from!==action.to){
    const rate=tradeRate(next,owner,action.from)
    if(hand[action.from]<rate||next.bank[action.to]<1)return match
    hand[action.from]-=rate;next.bank[action.from]+=rate;receive(next,owner,{[action.to]:1})
    message=`${name} traded with the bank.`
  } else if(action.type==='offer'&&next.phase==='build'){
    const target=action.target
    if(!Number.isInteger(target)||!next.players[target]||target===owner||!action.give||!action.take)return match
    if(!cardsTotal(action.give)||!cardsTotal(action.take)||!validSelection(action.give,cardsTotal(action.give),hand)||!validSelection(action.take,cardsTotal(action.take),resources(19)))return match
    if(RESOURCES.some(resource=>action.give[resource]&&action.take[resource]))return match
    next.offer={target,give:action.give,take:action.take};next.phase='offer'
    message=`${name} offered a trade to ${next.players[target].name}.`
  } else if(action.type==='respond'&&next.phase==='offer'){
    const offer=next.offer
    if(action.accept){
      if(!validSelection(offer.take,cardsTotal(offer.take),next.hands[offer.target]))return match
      for(const resource of RESOURCES){const difference=(offer.give[resource]||0)-(offer.take[resource]||0);hand[resource]-=difference;next.hands[offer.target][resource]+=difference}
    }
    message=`${next.players[offer.target].name} ${action.accept?'accepted':'declined'} the trade.`
    next.offer=null;next.phase='build'
  } else if(action.type==='buyDevelopment'&&next.phase==='build'&&next.deck.length&&affordable(hand,'development')){
    pay(next,owner,'development');next.development[owner].push({type:next.deck.pop(),bought:next.turn})
    message=`${name} bought a development card.`
  } else if(action.type==='playDevelopment'&&playableCards(next).includes(action.index)){
    const [card]=next.development[owner].splice(action.index,1)
    next.playedDevelopment=true;next.resumePhase=next.phase
    if(card.type==='knight'){next.knights[owner]++;next.phase='robber'}
    if(card.type==='roads'){next.freeRoads=2;next.phase='freeRoads'}
    if(card.type==='plenty')next.phase='plenty'
    if(card.type==='monopoly')next.phase='monopoly'
    message=`${name} played ${CARD_NAMES[card.type]}.`
  } else if(action.type==='plenty'&&next.phase==='plenty'){
    if(!validSelection(action.cards,Math.min(2,cardsTotal(next.bank)),next.bank))return match
    receive(next,owner,action.cards);next.phase=next.resumePhase
    message=`${name} received resources from the bank.`
  } else if(action.type==='monopoly'&&next.phase==='monopoly'&&RESOURCES.includes(action.resource)){
    next.hands.forEach((cards,player)=>{if(player!==owner){hand[action.resource]+=cards[action.resource];cards[action.resource]=0}})
    next.phase=next.resumePhase;message=`${name} collected ${action.resource}.`
  } else if(action.type==='end'&&next.phase==='build'){
    resolveAwards(next)
    if(next.winner!==null)return next
    next.current=(owner+1)%next.players.length;next.turn++;next.phase='roll';next.playedDevelopment=false;next.dice=null
    message=`${next.players[next.current].name}'s turn.`
  } else return match
  resolveAwards(next)
  next.revision++
  next.log=[message,...next.log].slice(0,40)
  return next
}

const vertexValue = (vertex) => vertex.tiles.reduce((total,id)=>total+(BOARD.tiles[id].number?6-Math.abs(7-BOARD.tiles[id].number):0),0)

function roadPreference(match, owner, edge) {
  const goals=settlementSites(match,owner,true).map(site=>site.id)
  const queue=edge.ends.map(id=>({id,distance:0}))
  const visited=new Set()
  while(queue.length){
    const {id,distance}=queue.shift()
    if(visited.has(id))continue
    visited.add(id)
    if(goals.includes(id))return 100-distance*10+vertexValue(BOARD.vertices[id])
    if(match.buildings[id]&&match.buildings[id].owner!==owner)continue
    for(const edgeId of BOARD.vertices[id].edges){
      if(match.roads[edgeId]!==undefined&&match.roads[edgeId]!==owner)continue
      const other=BOARD.edges[edgeId].ends.find(end=>end!==id)
      if(!visited.has(other))queue.push({id:other,distance:distance+1})
    }
  }
  return 0
}

export function botAction(match) {
  const owner=actor(match)
  const hand=match.hands[owner]
  if(match.phase==='setupSettlement'){
    const owned=Object.entries(match.buildings).filter(([,building])=>building.owner===owner).flatMap(([id])=>BOARD.vertices[id].tiles.map(tile=>BOARD.tiles[tile].resource))
    const value=site=>vertexValue(site)+site.tiles.filter(id=>!owned.includes(BOARD.tiles[id].resource)).length*3
    return {type:'settlement',id:buildSites(match,'settlement').sort((left,right)=>value(right)-value(left))[0].id}
  }
  if(match.phase==='setupRoad')return {type:'road',id:buildSites(match,'road').sort((left,right)=>roadPreference(match,owner,right)-roadPreference(match,owner,left))[0].id}
  if(match.phase==='discard'){
    const cards=resources();const remaining={...hand}
    for(let index=0;index<match.discards[0].count;index++){const resource=RESOURCES.toSorted((left,right)=>remaining[right]-remaining[left])[0];cards[resource]++;remaining[resource]--}
    return {type:'discard',cards}
  }
  if(match.phase==='offer')return {type:'respond',accept:validSelection(match.offer.take,cardsTotal(match.offer.take),hand)&&cardsTotal(match.offer.give)>=cardsTotal(match.offer.take)}
  if(match.phase==='victim')return {type:'steal',target:match.victims.toSorted((left,right)=>cardsTotal(match.hands[right])-cardsTotal(match.hands[left]))[0]}
  if(match.phase==='robber'){
    const value=tile=>tile.corners.reduce((total,id)=>total+(match.buildings[id]?(match.buildings[id].owner===owner?-5:2)*match.buildings[id].level:0),0)
    return {type:'robber',id:BOARD.tiles.filter(tile=>tile.id!==match.robber).sort((left,right)=>value(right)-value(left))[0].id}
  }
  if(match.phase==='plenty'){
    const cards=resources();const available={...match.bank}
    for(let index=0;index<Math.min(2,cardsTotal(match.bank));index++){const resource=RESOURCES.filter(resource=>available[resource]).sort((left,right)=>(hand[left]+cards[left])-(hand[right]+cards[right]))[0];cards[resource]++;available[resource]--}
    return {type:'plenty',cards}
  }
  if(match.phase==='monopoly')return {type:'monopoly',resource:RESOURCES.toSorted((left,right)=>hand[left]-hand[right])[0]}
  if(match.phase==='freeRoads')return {type:'road',id:roadSites(match,owner).sort((left,right)=>roadPreference(match,owner,right)-roadPreference(match,owner,left))[0].id}
  const playable=playableCards(match)
  if(playable.length)return {type:'playDevelopment',index:playable[0]}
  if(match.phase==='roll')return {type:'roll'}
  const goals=[['city',citySites(match,owner)],['settlement',settlementSites(match,owner)],['development',match.deck.length?[{id:0}]:[]],['road',roadSites(match,owner).sort((left,right)=>roadPreference(match,owner,right)-roadPreference(match,owner,left))]]
  for(const [type,sites] of goals){
    if(!sites.length)continue
    if(affordable(hand,type))return type==='development'?{type:'buyDevelopment'}:{type,id:sites[0].id}
  }
  for(const [type,sites] of goals){
    if(!sites.length)continue
    const needed=Object.keys(COSTS[type]).find(resource=>hand[resource]<COSTS[type][resource]&&match.bank[resource]>0)
    const donor=RESOURCES.find(resource=>resource!==needed&&hand[resource]-(COSTS[type][resource]||0)>=tradeRate(match,owner,resource))
    if(needed&&donor)return {type:'trade',from:donor,to:needed}
  }
  return {type:'end'}
}
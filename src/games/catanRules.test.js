import test from 'node:test'
import assert from 'node:assert/strict'
import { BOARD, RESOURCES, act, botAction, newMatch, actor, score, longestRoad } from './catanRules.js'
const players=Array.from({length:4},(_,id)=>({id,name:`Player ${id}`,isBot:true}))
const setup=(count=4)=>{let match=newMatch(players.slice(0,count),()=>0);while(match.phase.startsWith('setup'))match=act(match,botAction(match));return match}
const fund=(match,owner)=>{for(const resource of RESOURCES){const amount=Math.min(5,match.bank[resource]);match.hands[owner][resource]+=amount;match.bank[resource]-=amount}}

test('manual snake-order setup and second settlement production conserve 19 cards',()=>{
  let match=newMatch(players,()=>0)
  assert.equal(Object.keys(match.buildings).length,0)
  assert.equal(act(match,{type:'roll'}),match)
  const order=[]
  while(match.phase.startsWith('setup')){if(match.phase==='setupSettlement')order.push(match.current);match=act(match,botAction(match))}
  assert.deepEqual(order,[0,1,2,3,3,2,1,0])
  assert.equal(Object.keys(match.roads).length,8)
  for(const resource of RESOURCES)assert.equal(match.bank[resource]+match.hands.reduce((total,hand)=>total+hand[resource],0),19)
})
test('discard choice, robber victim choice and phase guards',()=>{
  let match=setup();fund(match,0)
  let roll=0
  match=act(match,{type:'roll'},()=>[.4,.55][roll++])
  assert.equal(match.phase,'discard')
  assert.equal(act(match,{type:'end'}),match)
  assert.equal(act(match,{type:'discard',cards:{wood:99}}),match)
  while(match.phase==='discard')match=act(match,botAction(match))
  assert.equal(match.phase,'robber')
  match=act(match,botAction(match))
  if(match.phase==='victim'){assert.equal(act(match,{type:'steal',target:0}),match);match=act(match,botAction(match))}
  assert.equal(match.phase,'build')
})
test('development purchase timing, one card per turn and all effect phases',()=>{
  for(const type of ['knight','roads','plenty','monopoly']){
    let match=setup();match.phase='build';match.turn=4;fund(match,0);match.deck=[type]
    match=act(match,{type:'buyDevelopment'})
    assert.equal(act(match,{type:'playDevelopment',index:0}),match)
    match.turn=8
    match=act(match,{type:'playDevelopment',index:0})
    assert.equal(match.playedDevelopment,true)
    for(let step=0;step<5&&!['build','roll'].includes(match.phase);step++)match=act(match,botAction(match))
    assert.equal(match.phase,'build')
    assert.equal(match.development[0].length,0)
  }
})
test('player trades require acceptance by the addressed player',()=>{
  let match=setup();match.phase='build';fund(match,0);fund(match,1)
  const before=structuredClone(match.hands)
  match=act(match,{type:'offer',target:1,give:{wood:1},take:{ore:1}})
  assert.equal(actor(match),1)
  assert.equal(act(match,{type:'respond',accept:true,actor:0}),match)
  match=act(match,{type:'respond',accept:true,actor:1})
  assert.equal(match.hands[0].wood,before[0].wood-1)
  assert.equal(match.hands[0].ore,before[0].ore+1)
  assert.equal(match.phase,'build')
})
test('road traversal does not reuse edges or pass opponent buildings',()=>{
  const match=setup();match.roads={};match.buildings={}
  const tile=BOARD.tiles[0]
  const loop=BOARD.edges.filter(edge=>edge.tiles.includes(tile.id))
  loop.forEach(edge=>{match.roads[edge.id]=0})
  assert.equal(longestRoad(match,0),6)
  match.buildings[tile.corners[0]]={owner:1,level:1}
  match.buildings[tile.corners[3]]={owner:1,level:1}
  assert.equal(longestRoad(match,0),3)
})
test('full three- and four-player bot matches finish and conserve resources',()=>{
  for(const count of [3,4])for(const initialSeed of [73,417,910]){
    let seed=initialSeed
    const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
    let match=newMatch(players.slice(0,count),random)
    for(let step=0;step<12000&&match.winner===null;step++){
      const next=act(match,botAction(match),random)
      assert.notEqual(next,match,`stuck ${match.phase}`)
      match=next
      for(const resource of RESOURCES){assert.equal(match.bank[resource]+match.hands.reduce((total,hand)=>total+hand[resource],0),19);assert.ok(match.bank[resource]>=0);for(const hand of match.hands)assert.ok(hand[resource]>=0)}
    }
    assert.notEqual(match.winner,null,`${count} players, seed ${initialSeed}`)
    assert.ok(score(match,match.winner)>=10)
  }
})

test('bank shortage pays a sole recipient but not competing recipients',()=>{
  let match=setup();match.buildings={};match.bank.wood=1
  const tile=BOARD.tiles[0]
  match.buildings[tile.corners[0]]={owner:0,level:2}
  const sole=act(match,{type:'roll'},()=>.4)
  assert.equal(sole.hands[0].wood,match.hands[0].wood+1)
  match.buildings[tile.corners[3]]={owner:1,level:1}
  const competing=act(match,{type:'roll'},()=>.4)
  assert.equal(competing.hands[0].wood,match.hands[0].wood)
  assert.equal(competing.hands[1].wood,match.hands[1].wood)
  assert.equal(competing.bank.wood,1)
})

test('largest army keeps its owner on ties and changes for a larger army',()=>{
  let match=setup();match.phase='build';match.knights=[3,3,0,0];match.largest=0
  match=act(match,{type:'end'})
  assert.equal(match.largest,0)
  match.phase='build';match.knights[1]=4
  match=act(match,{type:'end'})
  assert.equal(match.largest,1)
})

test('hidden points count only in private scoring and win on the owners turn',()=>{
  let match=setup();match.phase='build';match.buildings={}
  for(const vertex of BOARD.vertices.slice(0,4))match.buildings[vertex.id]={owner:1,level:2}
  match.development[1]=[{type:'victory',bought:0},{type:'victory',bought:0}]
  assert.equal(score(match,1,false),8)
  assert.equal(score(match,1),10)
  match=act(match,{type:'end'})
  assert.equal(match.current,1)
  assert.equal(match.winner,1)
  assert.equal(act(match,{type:'roll'}),match)
})
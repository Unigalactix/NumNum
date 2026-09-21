import test from 'node:test'
import assert from 'node:assert/strict'
import { Chess } from 'chess.js'
import { chessResult, restoreChess, repetitionCount } from './chessRules.js'
test('history survives serialization and repetition is claimable before automatic fivefold', () => {
  const cycle = ['Nf3','Nf6','Ng1','Ng8']
  const moves = JSON.parse(JSON.stringify([...cycle,...cycle]))
  const game = restoreChess(moves)
  assert.equal(repetitionCount(game),3)
  assert.equal(chessResult(game),null)
  assert.equal(game.isThreefoldRepetition(),true)
  assert.equal(chessResult(restoreChess([...moves,...moves])),'Draw by fivefold repetition')
})
test('castling, en passant and checkmate are preserved', () => {
  const castle = restoreChess(['e4','e5','Nf3','Nc6','Bc4','Nf6','O-O'])
  assert.equal(castle.get('g1').type,'k')
  assert.equal(castle.get('f1').type,'r')
  const passant = restoreChess(['e4','a6','e5','d5','exd6'])
  assert.equal(passant.get('d5'),undefined)
  assert.equal(passant.get('d6').type,'p')
  assert.equal(chessResult(restoreChess(['f3','e5','g4','Qh4#'])),'Neha wins by checkmate')
})
test('all four promotion choices are legal and 75-move draw is automatic', () => {
  for (const promotion of ['q','r','b','n']) {
    const game = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1')
    game.move({from:'a7',to:'a8',promotion})
    assert.equal(game.get('a8').type,promotion)
  }
  const game = new Chess('7k/8/8/8/8/8/R7/7K w - - 150 100')
  assert.equal(chessResult(game),'Draw by the 75-move rule')
})
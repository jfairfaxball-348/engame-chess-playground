/**
 * KRK03 release contract.
 *
 * These are adversarial falsification tests, NOT a formal proof of winning play.
 * They must remain in CI when an eventual total proof-derived KRK policy lands.
 * Experimental KRK play is separately opted in; certified release stays locked.
 *
 * Regression: practical PR #5, run 40891590400, drew by fivefold at ply 21
 * against a distance-seeking lone king. Green local witness tests alone do
 * not justify a complete KRK opponent or a 97/98-ply guarantee.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATERIAL,applyMove,coords,distance,findKing,initialSetup,legalMoves,
  makeBoard,newGame,opposite,outcome,play,positionKey,squareAt,validateSetup
} from '../src/chess.js';
import {chooseDecision} from '../src/engine.js';
import {setupVerdict} from '../src/maths-model.js';
import {KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {krkWallClimbChoice} from '../src/krk-wall-climb.js';

function handoffRoot() {
  // Legal fresh root: White Kd2 Ra3, Black Kf4, White to move.
  const b=makeBoard();
  b[squareAt(3,1)]='wK';
  b[squareAt(0,2)]='wR';
  b[squareAt(5,3)]='bK';
  return {board:b,material:'krk',turn:'w',halfmove:0,
    history:[positionKey(b,'w')],log:[]};
}

test('KRK03 known READY handoff is not misrepresented as a selected winning move',()=>{
  const root=handoffRoot();
  assert.equal(validateSetup(root.board,'krk','w'),null);
  const local=krkWallClimbChoice(root,'id');
  assert.equal(local?.kind,'handoff');
  assert.equal(local?.move,undefined);
  assert.equal(local?.isCompleteWinningPolicy,false);
  assert.equal(local?.maxMatePlies,null);
  if(KRK_GAMEPLAY_RELEASED) {
    // An eventual release must compose the handoff into a real legal move.
    // A local witness alone cannot discharge the rest of the game.
    const decision=chooseDecision(root,'w');
    assert.ok(decision?.move,'released policy must handle the READY lower-band root');
    assert.ok(legalMoves(root.board,'w').some(m=>
      m.from===decision.move.from&&m.to===decision.move.to));
  }
});

test('the release flag, material gate, Maths Start gate and engine dispatch cannot drift',()=>{
  for(const strong of ['w','b'])for(const turn of ['w','b']){
    const board=initialSetup('krk',strong);
    assert.equal(validateSetup(board,'krk',turn),null);
    const verdict=setupVerdict(board,turn);
    assert.equal(MATERIAL.krk.playable,KRK_GAMEPLAY_RELEASED);
    assert.equal(verdict.canStart,true,'owner-approved experimental KRK Start');
    assert.equal(verdict.experimental,true);
    if(!KRK_GAMEPLAY_RELEASED){
      assert.equal(verdict.strategyPending,false);
      assert.throws(()=>newGame(board,turn,'krk'),/certified playground/i);
      assert.equal(newGame(board,turn,'krk',{experimentalKRK:true}).turn,turn);
      const state={board,turn,material:'krk',halfmove:0,
        history:[positionKey(board,turn)],log:[]};
      assert.equal(chooseDecision(state,strong),null);
    }
  }
});

const defence=[
  {name:'distance',score:(m,b,strong)=>distance(m.to,findKing(b,strong))*8},
  {name:'rook pursuit',score:(m,b,strong)=>-distance(m.to,b.indexOf(strong+'R'))*8},
  {name:'centre',score:m=>{
    const [x,y]=coords(m.to);return -(Math.abs(3.5-x)+Math.abs(3.5-y))*8;
  }},
  {name:'edge',score:m=>{
    const [x,y]=coords(m.to);return (Math.abs(3.5-x)+Math.abs(3.5-y))*8;
  }}
];

test('if KRK is released, both colours and initial turns mate four distinct legal defenders',()=>{
  if(!KRK_GAMEPLAY_RELEASED)return; // Not a skipped obligation on an enabled build.
  let completed=0;
  for(const strong of ['w','b'])for(const turn of ['w','b'])
    for(const mode of defence){
      let game=newGame(initialSetup('krk',strong),turn,'krk');
      let terminal=outcome(game.board,game.turn,game.history,game.halfmove);
      for(let ply=0;ply<150 && terminal.kind==='ongoing';ply++){
        let move;
        if(game.turn===strong){
          const decision=chooseDecision(game,strong);
          assert.ok(decision?.move,JSON.stringify({strong,turn,mode:mode.name,ply}));
          assert.ok(legalMoves(game.board,strong).some(m=>
            m.from===decision.move.from&&m.to===decision.move.to));
          game.krkFrame=decision.frame||game.krkFrame;
          game.krkProofContext=decision.proofContext||null;
          move=decision.move;
        } else {
          move=legalMoves(game.board,game.turn).slice().sort((a,b)=>
            mode.score(b,game.board,strong)-mode.score(a,game.board,strong)||
            a.to-b.to)[0];
        }
        assert.ok(move);
        game=play(game,move);
        terminal=outcome(game.board,game.turn,game.history,game.halfmove);
      }
      assert.equal(terminal.kind,'mate',JSON.stringify({
        strong,turn,mode:mode.name,result:terminal,plies:game.log.length,
        lastMoves:game.log.slice(-30)
      }));
      assert.equal(terminal.winner,strong);
      completed++;
    }
  assert.equal(completed,16);
});

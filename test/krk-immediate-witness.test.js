import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  makeBoard,squareAt,validateSetup,legalMoves,applyMove,outcome,
  positionKey,newGame
} from '../src/chess.js';
import {KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {
  KRK_IMMEDIATE_RULE,krkHorizontalMateGeometry,
  krkMateNowTargets,krkImmediateMateWitness
} from '../src/krk-immediate-witness.js';

const sq=squareAt;
function root(strong,sk,rs,wk,halfmove=0){
  const b=makeBoard(),weak=strong==='w'?'b':'w';
  b[sq(...sk)]=strong+'K';b[sq(...rs)]=strong+'R';b[sq(...wk)]=weak+'K';
  return {board:b,turn:strong,material:'krk',halfmove,
    history:[positionKey(b,strong)],log:[]};
}
test('the frozen Horizontal arithmetic includes corner, interior and both board edges',()=>{
  assert.equal(krkHorizontalMateGeometry([1,5],[7,7],[0,7]),true);
  assert.equal(krkHorizontalMateGeometry([6,5],[0,7],[7,7]),true);
  assert.equal(krkHorizontalMateGeometry([4,5],[0,7],[4,7]),true);
  assert.equal(krkHorizontalMateGeometry([4,2],[7,0],[4,0]),true);
  assert.equal(krkHorizontalMateGeometry([2,5],[7,7],[0,7]),false);
  assert.equal(krkHorizontalMateGeometry([1,4],[7,7],[0,7]),false);
  assert.equal(krkHorizontalMateGeometry([1,5],[1,7],[0,7]),false);
});

test('exact frozen rank and file checkmate witnesses for both strong colours',()=>{
  const fixtures=[
    {sk:[1,5],rs:[7,0],wk:[0,7],dest:[7,7],case:'horizontal'},
    {sk:[6,5],rs:[0,0],wk:[7,7],dest:[0,7],case:'horizontal'},
    {sk:[4,2],rs:[7,7],wk:[4,0],dest:[7,0],case:'horizontal'},
    {sk:[4,5],rs:[0,0],wk:[4,7],dest:[0,7],case:'horizontal'},
    {sk:[5,1],rs:[0,7],wk:[7,0],dest:[7,7],case:'vertical'}
  ];
  for(const colour of ['w','b'])for(const f of fixtures){
    const st=root(colour,f.sk,f.rs,f.wk);
    assert.equal(validateSetup(st.board,'krk',colour),null);
    const w=krkImmediateMateWitness(st);
    assert.ok(w,`no witness ${colour} ${JSON.stringify(f)}`);
    assert.equal(w.move.from,sq(...f.rs));
    assert.equal(w.move.to,sq(...f.dest));
    assert.equal(w.case,f.case);
    assert.equal(w.rule,KRK_IMMEDIATE_RULE);
    assert.equal(w.maxMatePlies,1);
    assert.equal(w.isCompleteWinningPolicy,false);
    assert.deepEqual(outcome(applyMove(st.board,w.move),colour==='w'?'b':'w'),{kind:'mate',winner:colour});
    assert.equal(newGame(st.board,colour,'krk').material,'krk');
  }
});

test('the immediate witness respects the actual clock/history and fails closed',()=>{
  const st=root('w',[1,5],[7,0],[0,7],99);
  st.history=['previous-board-key',positionKey(st.board,'w')];
  const w=krkImmediateMateWitness(st);
  assert.ok(w);assert.equal(w.inputHalfmove,99);assert.equal(w.inputHistoryLength,2);
  assert.equal(w.maxMatePlies,1);
  assert.equal(krkImmediateMateWitness({...st,halfmove:150}),null);
  assert.equal(krkImmediateMateWitness({...st,history:null}),null);
  assert.equal(krkImmediateMateWitness({...st,turn:'b'}),null);
  assert.equal(krkImmediateMateWitness({...st,material:'kk'}),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,true);
});

test('maths gameplay cannot import a terminal witness as an unproved total strategy',()=>{
  const app=readFileSync('src/maths-app.js','utf8');
  const engine=readFileSync('src/engine.js','utf8');
  assert.doesNotMatch(app,/krk-immediate-witness|krk-local-witness/);
  assert.doesNotMatch(engine,/krk-immediate-witness|krk-local-witness/);
  const text=readFileSync('src/krk-immediate-witness.js','utf8');
  const executable=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
  assert.doesNotMatch(executable,/Stockfish|Lozza|Syzygy|tablebase|\bfetch\s*\(|\bminimax\b/i);
});

test('supplementary geometry diagnostics match direct legal mate outcomes in edge families',()=>{
  // Independent finite comparison is NOT a proof of the general equivalence.
  let roots=0, mates=0;
  const kingFiles=[0,1,2,3,4,5,6,7];
  for(const strong of ['w','b'])for(const wy of [0,7])for(const wx of kingFiles)
    for(const sy of [2,5])for(const sx of kingFiles)
      for(const ry of [0,1,3,4,6,7])for(const rx of [0,3,7]){
        const st=root(strong,[sx,sy],[rx,ry],[wx,wy]);
        if(validateSetup(st.board,'krk',strong))continue;
        roots++;
        const weak=strong==='w'?'b':'w';
        const winningMoves=legalMoves(st.board,strong).filter(m=>
          outcome(applyMove(st.board,m),weak).kind==='mate'
        );
        const selected=krkImmediateMateWitness(st);
        assert.equal(Boolean(selected),winningMoves.length>0,
          `MateNow mismatch ${strong} sk=${sx},${sy} r=${rx},${ry} wk=${wx},${wy}`);
        if(selected){
          mates++;
          assert.ok(winningMoves.some(m=>m.from===selected.move.from&&m.to===selected.move.to));
          assert.ok(krkMateNowTargets(st.board,strong).some(t=>t.target===selected.move.to));
        }
      }
  assert.ok(roots>1000);
  assert.ok(mates>50);
  console.log('KRK01 immediate-mate finite diagnostics:',{roots,mates});
});

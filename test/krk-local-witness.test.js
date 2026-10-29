import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  makeBoard, squareAt, validateSetup, newGame,
  legalMoves, applyMove, outcome, positionKey
} from '../src/chess.js';
import { chooseDecision } from '../src/engine.js';
import {
  KRK_PARENT_SHA, KRK_GAMEPLAY_RELEASED, KRK_WITNESS_RULES, KRK_FRAMES,
  krkTransformSquare, krkLocalWitness, auditKRKLocalWitness
} from '../src/krk-local-witness.js';

const s = squareAt;
function state(strong='w', sk=[3,0], rs=[4,2], wk=[5,3], halfmove=0) {
  const b=makeBoard(), weak=strong==='w'?'b':'w';
  b[s(...sk)]=strong+'K'; b[s(...rs)]=strong+'R'; b[s(...wk)]=weak+'K';
  return {board:b,turn:strong,material:'krk',halfmove,
    history:[positionKey(b,strong)],log:[]};
}
function transformedState(st, isometry) {
  const board=makeBoard();
  for(let i=0;i<64;i++)if(st.board[i])board[krkTransformSquare(i,isometry)]=st.board[i];
  return {...st,board,history:[positionKey(board,st.turn)]};
}
function exercise(st,rule,isometry='id') {
  const w=krkLocalWitness(st,rule,isometry);
  if(!w)return false;
  assert.equal(w.origin,'local-lean-geometric-witness');
  assert.equal(w.isometry,isometry);
  assert.equal(w.rule,KRK_WITNESS_RULES[rule]);
  assert.equal(w.parent,KRK_PARENT_SHA);
  assert.equal(w.maxMatePlies,null);
  assert.equal(w.isCompleteWinningPolicy,false);
  assert.ok(legalMoves(st.board,st.turn).some(m=>m.from===w.move.from&&m.to===w.move.to));
  const audit=auditKRKLocalWitness(st,w);
  assert.equal(audit.ok,true,`all-reply violation: ${rule} ${JSON.stringify(st.board)}`);
  assert.ok(audit.replies>0);
  return true;
}

test('release remains fail-closed; a local witness is not an autoplay selector',()=>{
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  const st=state();
  assert.throws(()=>newGame(st.board,st.turn,'krk'),/not released/);
  assert.equal(chooseDecision(st,st.turn),null);
  assert.equal(krkLocalWitness(st,'automatic'),null);
  assert.equal(krkLocalWitness(st,undefined),null);
  assert.equal(krkLocalWitness(st,'rescue','rotate-heuristic'),null);
  const text=readFileSync('src/krk-local-witness.js','utf8');
  const executable=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
  assert.doesNotMatch(executable,/stockfish|lozza|syzygy|tablebase|fetch\s*\(|minimax|retrograde/i);
});

test('rook-rescue witness uses the exact far file and preserves all replies for both colours',()=>{
  for(const colour of ['w','b']){
    const st=state(colour);
    assert.equal(validateSetup(st.board,'krk',colour),null);
    assert.equal(exercise(st,'rescue'),true);
    const w=krkLocalWitness(st,'rescue');
    assert.equal(w.move.from,s(4,2));
    assert.equal(w.move.to,s(0,2));
  }
});

test('wall tempo and pursuit are separate local lemmas, not a looping policy',()=>{
  for(const colour of ['w','b']){
    const wall=state(colour,[3,0],[3,2],[5,5]);
    assert.equal(exercise(wall,'wall'),true);
    assert.equal(krkLocalWitness(wall,'wall').move.to,s(0,2));
    const pursuit=state(colour,[2,1],[0,2],[5,3]);
    assert.equal(exercise(pursuit,'pursuit'),true);
    assert.equal(krkLocalWitness(pursuit,'pursuit').move.to,s(3,1));
  }
});

test('no fabricated certificates on invalid geometry, missing metadata or wrong turn',()=>{
  const st=state(),op=st.turn==='w'?'b':'w';
  assert.equal(krkLocalWitness({...st,turn:op},'rescue'),null);
  assert.equal(krkLocalWitness({...st,history:null},'rescue'),null);
  assert.equal(krkLocalWitness({...st,halfmove:-1},'rescue'),null);
  assert.equal(krkLocalWitness({...st,material:'kk'},'rescue'),null);
  assert.equal(krkLocalWitness(state('w',[3,0],[4,2],[5,3]),'pursuit'),null);
  const w=krkLocalWitness(st,'rescue');
  assert.equal(auditKRKLocalWitness(st,{...w,move:{...w.move,to:s(7,7)}}).ok,false);
  assert.equal(auditKRKLocalWitness(st,{...w,parent:'unverified'}).ok,false);
  assert.equal(auditKRKLocalWitness(st,{...w,isometry:'unknown'}).ok,false);
});

test('a clock-close or incoming-history state never gains an invented fresh mate bound',()=>{
  const st=state('w',[3,0],[4,2],[5,3],99);
  st.history=[...Array(4).fill('other'),positionKey(st.board,st.turn)];
  const w=krkLocalWitness(st,'rescue');
  assert.ok(w);assert.equal(w.maxMatePlies,null);
  assert.equal(w.inputHalfmove,99);
  assert.equal(w.inputHistoryLength,5);
  assert.equal(auditKRKLocalWitness(st,w).ok,true);
});

test('KRK terminal, safe-rook capture and KK transition remain explicit and gated',()=>{
  const st=state('w',[4,0],[4,5],[4,6]);
  assert.equal(validateSetup(st.board,'krk','b'),null);
  const capture=legalMoves(st.board,'b').find(m=>m.to===s(4,5));
  assert.ok(capture);
  const kk=applyMove(st.board,capture);
  assert.equal(kk.filter(Boolean).length,2);
  assert.equal(krkLocalWitness({...st,board:kk},'rescue'),null);
  const mate=state('w',[2,6],[0,7],[0,0]);
  assert.equal(outcome(mate.board,'b').kind,'ongoing'); // not a legal mate arrangement
  assert.equal(krkLocalWitness({...mate,turn:'b'},'wall'),null);
});

test('four frozen Lean isometries are bijective involutions and preserve legal moves',()=>{
  assert.deepEqual(KRK_FRAMES,['id','flip-rank','swap-axis','anti-axis']);
  for(const iso of KRK_FRAMES){
    const image=new Set();
    for(let i=0;i<64;i++){
      const j=krkTransformSquare(i,iso);
      assert.ok(j>=0&&j<64);
      assert.equal(krkTransformSquare(j,iso),i);
      image.add(j);
    }
    assert.equal(image.size,64);
    for(const colour of ['w','b']){
      const base=state(colour,[3,0],[4,2],[5,3]);
      const copy=transformedState(base,iso);
      assert.equal(validateSetup(copy.board,'krk',copy.turn),null);
      const orig=new Set(legalMoves(base.board,base.turn)
        .map(m=>krkTransformSquare(m.from,iso)+':'+krkTransformSquare(m.to,iso)));
      const rotated=new Set(legalMoves(copy.board,copy.turn)
        .map(m=>m.from+':'+m.to));
      assert.deepEqual(rotated,orig,`legal move transport ${iso}/${colour}`);
    }
  }
  assert.equal(krkTransformSquare(-1,'id'),-1);
  assert.equal(krkTransformSquare(64,'id'),-1);
});

test('all four explicit frames transport each witness and preserve every defending reply',()=>{
  const samples={
    rescue:state('w',[3,0],[4,2],[5,3]),
    wall:state('w',[3,0],[3,2],[5,5]),
    pursuit:state('w',[2,1],[0,2],[5,3])
  };
  for(const colour of ['w','b'])for(const iso of KRK_FRAMES){
    for(const [rule,sample] of Object.entries(samples)){
      const b=sample.board.map(p=>p?(colour+p[1]):null);
      const base={...sample,board:b,turn:colour,history:[positionKey(b,colour)]};
      const st=transformedState(base,iso);
      assert.equal(validateSetup(st.board,'krk',colour),null);
      assert.equal(exercise(st,rule,iso),true);
      const a=krkLocalWitness(base,rule,'id');
      const transformed=krkLocalWitness(st,rule,iso);
      assert.equal(transformed.move.from,krkTransformSquare(a.move.from,iso));
      assert.equal(transformed.move.to,krkTransformSquare(a.move.to,iso));
      if(iso!=='id' && rule==='rescue'){
        assert.equal(transformed.inputHistoryLength,1);
        assert.equal(transformed.maxMatePlies,null);
      }
    }
  }
});

test('broad deterministic adversarial diagnostics across legal framed positions',()=>{
  // These are diagnostics, not proof: all legal defender replies are checked
  // for each applicable ONE-STEP witness over selected rank bands.
  const cases=[[0,2,3],[0,3,6],[1,2,3],[1,3,7],[2,4,6],[3,5,7]];
  const counts={w:{rescue:0,wall:0,pursuit:0},b:{rescue:0,wall:0,pursuit:0}};
  for(const colour of ['w','b'])for(const [sy,ry,wy] of cases){
    for(let sx=0;sx<8;sx++)for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
      const st=state(colour,[sx,sy],[rx,ry],[wx,wy]);
      if(validateSetup(st.board,'krk',colour))continue;
      for(const rule of Object.keys(KRK_WITNESS_RULES)){
        if(exercise(st,rule))counts[colour][rule]++;
      }
    }
  }
  for(const colour of ['w','b'])for(const rule of Object.keys(KRK_WITNESS_RULES)){
    assert.ok(counts[colour][rule]>0, `${colour} ${rule}: no covered fixtures`);
  }
  console.log('KRK01 applicable canonical local witnesses:',counts);
  const mapped={};
  for(const iso of KRK_FRAMES.filter(f=>f!=='id')){
    mapped[iso]={w:{rescue:0,wall:0,pursuit:0},b:{rescue:0,wall:0,pursuit:0}};
    for(const colour of ['w','b'])for(const [sy,ry,wy] of cases){
      for(let sx=0;sx<8;sx++)for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
        const base=state(colour,[sx,sy],[rx,ry],[wx,wy]);
        if(validateSetup(base.board,'krk',colour))continue;
        const st=transformedState(base,iso);
        for(const rule of Object.keys(KRK_WITNESS_RULES)){
          if(exercise(st,rule,iso))mapped[iso][colour][rule]++;
        }
      }
    }
    for(const colour of ['w','b'])for(const rule of Object.keys(KRK_WITNESS_RULES)){
      assert.equal(mapped[iso][colour][rule],counts[colour][rule]);
    }
  }
  console.log('KRK01 transported witnesses (one-step only):',mapped);
});

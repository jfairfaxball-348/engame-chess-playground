import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite} from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare,KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {krkReadyCutTempoChoice,auditKRKReadyCutTempo,KRK_READY_TEMPO_LEMMA}
  from '../src/krk-ready-cut-tempo.js';

function root(c,sk,rs,wk){
  const b=makeBoard();b[squareAt(...sk)]=c+'K';
  b[squareAt(...rs)]=c+'R';b[squareAt(...wk)]=opposite(c)+'K';
  return {board:b,turn:c,material:'krk',history:[positionKey(b,c)],halfmove:0,log:[]};
}
function transform(s,frame){
  const b=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,frame)]=s.board[i];
  return {...s,board:b,history:[positionKey(b,s.turn)]};
}

test('a concrete narrow READY band executes the frozen wallWaitFile rook move',()=>{
  const s=root('w',[3,1],[0,2],[4,3]);
  const c=krkReadyCutTempoChoice(s);
  assert.ok(c);
  assert.equal(c.rule,KRK_READY_TEMPO_LEMMA);
  assert.equal(c.move.from,squareAt(0,2));
  assert.equal(c.move.to,squareAt(1,2));
  assert.equal(c.maxMatePlies,null);
  assert.equal(c.isCompleteWinningPolicy,false);
  const audit=auditKRKReadyCutTempo(s);
  assert.equal(audit.ok,true,JSON.stringify(audit));
  assert.ok(audit.replies>0);
  assert.equal(Object.values(audit.phases).reduce((a,b)=>a+b,0),audit.replies);
});

test('both strong colours and all four theorem frames partition EVERY defender reply',()=>{
  let checked=0;
  const examples=[
    [[3,1],[0,2],[4,3]],
    [[4,1],[7,2],[3,3]],
    [[3,0],[0,1],[4,2]],
    [[4,2],[7,3],[3,4]]
  ];
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
    for(const [sk,rs,wk] of examples){
      const s=transform(root(colour,sk,rs,wk),frame);
      const c=krkReadyCutTempoChoice(s,frame);
      assert.ok(c,JSON.stringify({colour,frame,sk,rs,wk}));
      const audit=auditKRKReadyCutTempo(s,frame);
      assert.ok(audit.ok,JSON.stringify({colour,frame,sk,rs,wk,audit}));
      checked+=audit.replies;
    }
  assert.ok(checked>50);
});

test('no narrow tempo for wide pivot, non-ready wall, weak turn or stale clock',()=>{
  const wide=root('w',[3,1],[0,2],[5,3]);
  assert.equal(krkReadyCutTempoChoice(wide),null);
  const unready=root('w',[1,0],[0,2],[4,3]);
  assert.equal(krkReadyCutTempoChoice(unready),null);
  const weak=root('w',[3,1],[0,2],[4,3]);
  weak.turn='b';weak.history=[positionKey(weak.board,'b')];
  assert.equal(krkReadyCutTempoChoice(weak),null);
  const old=root('w',[3,1],[0,2],[4,3]);
  old.halfmove=150;
  assert.equal(krkReadyCutTempoChoice(old),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

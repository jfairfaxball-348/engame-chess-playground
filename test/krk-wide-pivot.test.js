import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,validateSetup}
  from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare,KRK_GAMEPLAY_RELEASED}
  from '../src/krk-local-witness.js';
import {krkWidePivotChoice,auditKRKWidePivot,KRK_WIDE_PIVOT_LEMMA,KRK_LEFT_PIVOT_LEMMA}
  from '../src/krk-wide-pivot.js';

function pos(colour,sk,rs,wk){
  const b=makeBoard();b[squareAt(...sk)]=colour+'K';
  b[squareAt(...rs)]=colour+'R';
  b[squareAt(...wk)]=opposite(colour)+'K';
  return {board:b,turn:colour,material:'krk',
    halfmove:0,history:[positionKey(b,colour)],log:[]};
}
function framePosition(s,f){
  const b=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,f)]=s.board[i];
  return {...s,board:b,history:[positionKey(b,s.turn)]};
}

test('original wide pivot handoff becomes a concrete Rook a3-e3 cut',()=>{
  const s=pos('w',[3,1],[0,2],[5,3]);
  const c=krkWidePivotChoice(s);
  assert.ok(c);assert.equal(c.kind,'step');
  assert.equal(c.rule,KRK_WIDE_PIVOT_LEMMA);
  assert.equal(c.move.from,squareAt(0,2));
  assert.equal(c.move.to,squareAt(4,2));
  const a=auditKRKWidePivot(s);
  assert.ok(a.ok,JSON.stringify(a));
  assert.ok(a.replies>0);
  assert.equal(c.isCompleteWinningPolicy,false);
  assert.equal(c.maxMatePlies,null);
});

test('already protected cut hands off and is never submitted as an illegal null rook move',()=>{
  const s=pos('w',[3,1],[4,2],[5,3]);
  const c=krkWidePivotChoice(s);
  assert.equal(c?.kind,'handoff');
  assert.equal(c?.move,undefined);
  assert.equal(auditKRKWidePivot(s).handoff,true);
});

test('all weak responses remain in right-side guarded region in four frames and both colours',()=>{
  let tried=0,replies=0;
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
  for(const sy of [0,1,2,3,4])
  for(const sx of [3,4])
  for(let rx=0;rx<8;rx++)
  for(let wx=sx+2;wx<8;wx++){
    const s=framePosition(pos(colour,[sx,sy],[rx,sy+1],[wx,sy+2]),frame);
    if(validateSetup(s.board,'krk',colour))continue;
    const c=krkWidePivotChoice(s,frame);
    assert.ok(c,JSON.stringify({colour,frame,sx,sy,rx,wx}));
    const audit=auditKRKWidePivot(s,frame);
    assert.ok(audit.ok,JSON.stringify({colour,frame,sx,sy,rx,wx,audit}));
    tried++;replies+=audit.replies;
  }
  assert.ok(tried>200);assert.ok(replies>100);
  console.log('KRK02 wide pivot conditional theorem diagnostic:',{tried,replies});
});

test('certified left-wide pivot mirrors the right cut and covers all replies',()=>{
  const left=pos('w',[4,1],[7,2],[2,3]);
  const c=krkWidePivotChoice(left);
  assert.equal(c?.kind,'step');
  assert.equal(c?.rule,KRK_LEFT_PIVOT_LEMMA);
  assert.equal(c?.move.from,squareAt(7,2));
  assert.equal(c?.move.to,squareAt(3,2));
  assert.ok(auditKRKWidePivot(left).ok);
  let tried=0;
  for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
  for(const sx of [3,4])
  for(let sy=0;sy<=4;sy++)
  for(let wx=0;wx<=sx-2;wx++)
  for(let rx=0;rx<8;rx++){
    const s=framePosition(pos(colour,[sx,sy],[rx,sy+1],[wx,sy+2]),frame);
    if(validateSetup(s.board,'krk',colour))continue;
    const d=krkWidePivotChoice(s,frame);
    assert.ok(d,JSON.stringify({colour,frame,sx,sy,rx,wx}));
    const a=auditKRKWidePivot(s,frame);
    assert.ok(a.ok,JSON.stringify({colour,frame,sx,sy,rx,wx,a}));
    tried++;
  }
  assert.ok(tried>100);
});
test('noncentral wall and unproved material remain unavailable',()=>{
  const notReady=pos('w',[1,1],[0,3],[5,4]);
  assert.equal(krkWidePivotChoice(notReady),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

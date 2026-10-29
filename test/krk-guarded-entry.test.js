import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,validateSetup}
  from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkGuardedEntryChoice,auditKRKGuardedEntry,KRK_GUARDED_LEMMA}
  from '../src/krk-guarded-entry.js';

function p(c,sk,rs,wk){
 const b=makeBoard();
 b[squareAt(...sk)]=c+'K';b[squareAt(...rs)]=c+'R';
 b[squareAt(...wk)]=opposite(c)+'K';
 return {board:b,turn:c,material:'krk',
   halfmove:0,history:[positionKey(b,c)],log:[]};
}
function frame(s,f){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,f)]=s.board[i];
 return {...s,board:b,history:[positionKey(b,s.turn)]};
}
test('guarded right-side cut executes a king advance and leaves a confined defender',()=>{
 const s=p('w',[3,1],[4,2],[5,3]);
 const c=krkGuardedEntryChoice(s);
 assert.ok(c);
 assert.equal(c.rule,KRK_GUARDED_LEMMA);
 assert.equal(c.move.from,squareAt(3,1));
 assert.equal(c.move.to,squareAt(3,2));
 const a=auditKRKGuardedEntry(s);
 assert.ok(a.ok,JSON.stringify(a));
 assert.ok(a.replies>0);
 assert.equal(c.maxMatePlies,null);
 assert.equal(c.isCompleteWinningPolicy,false);
});
test('guarded geometry holds against all weak moves in both colours and four frames',()=>{
 let tries=0,replies=0;
 for(const colour of ['w','b'])for(const iso of KRK_FRAMES)
 for(const rx of [3,4,5])for(let ry=1;ry<7;ry++)
 for(let wx=rx+1;wx<8;wx++)for(let wy=ry+1;wy<8;wy++){
   const s=frame(p(colour,[rx-1,ry-1],[rx,ry],[wx,wy]),iso);
   if(validateSetup(s.board,'krk',colour))continue;
   const c=krkGuardedEntryChoice(s,iso);
   assert.ok(c,JSON.stringify({colour,iso,rx,ry,wx,wy}));
   const a=auditKRKGuardedEntry(s,iso);
   assert.ok(a.ok,JSON.stringify({colour,iso,rx,ry,wx,wy,a}));
   tries++;replies+=a.replies;
 }
 assert.ok(tries>200);assert.ok(replies>150);
 console.log('KRK02 guarded all-reply cases:',{tries,replies});
});
test('guarded entry is not a game-playing policy and rejects other orientations',()=>{
 assert.equal(krkGuardedEntryChoice(p('w',[4,1],[3,2],[2,3])),null);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

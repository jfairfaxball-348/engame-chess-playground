import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,validateSetup,play,legalMoves}
  from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkOppositionCheckChoice,auditKRKOppositionCheck,
  krkOppositionFollowChoice,auditKRKOppositionFollow}
  from '../src/krk-opposition.js';

function s(c,sk,rs,wk){
 const b=makeBoard();b[squareAt(...sk)]=c+'K';b[squareAt(...rs)]=c+'R';b[squareAt(...wk)]=opposite(c)+'K';
 return {board:b,turn:c,material:'krk',halfmove:0,history:[positionKey(b,c)],log:[]};
}
function transformed(st,f){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(st.board[i])b[krkTransformSquare(i,f)]=st.board[i];
 return {...st,board:b,history:[positionKey(b,st.turn)]};
}
test('opposed king check is a mate in one on the upper edge',()=>{
 const st=s('w',[4,5],[0,0],[4,7]);
 const c=krkOppositionCheckChoice(st);
 assert.ok(c);
 assert.equal(c.move.to,squareAt(0,7));
 const v=auditKRKOppositionCheck(st);
 assert.deepEqual({ok:v.ok,mate:v.mate,replies:v.replies},{ok:true,mate:true,replies:0});
});
test('four-ply check then king-up: all first and second replies have the proved barrier rank',()=>{
 let roots=0,firstReplies=0,secondReplies=0;
 for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
 for(const ky of [0,1,2,3,4])
 for(const kx of [3,4])
 for(const rx of [0,7])
 for(const ry of [0,1,2,3,4,5,6,7]){
   if(ry===ky+2||Math.abs(rx-kx)<4)continue;
   const st=transformed(s(colour,[kx,ky],[rx,ry],[kx,ky+2]),frame);
   if(validateSetup(st.board,'krk',colour))continue;
   const c=krkOppositionCheckChoice(st,frame);
   assert.ok(c,JSON.stringify({colour,frame,kx,ky,rx,ry}));
   const audit=auditKRKOppositionCheck(st,frame);
   assert.ok(audit.ok&&audit.followCertified,JSON.stringify(audit));
   roots++;
   const afterCheck=play(st,c.move);
   for(const reply of legalMoves(afterCheck.board,afterCheck.turn)){
     firstReplies++;
     const s2=play(afterCheck,reply);
     const next=krkOppositionFollowChoice(s2,c.proofContext);
     assert.ok(next,JSON.stringify({colour,frame,kx,ky,rx,ry,reply}));
     const follow=auditKRKOppositionFollow(s2,c.proofContext);
     assert.ok(follow.ok,JSON.stringify({colour,frame,kx,ky,rx,ry,reply,follow}));
     secondReplies+=follow.replies;
   }
 }
 assert.ok(roots>15&&firstReplies>15&&secondReplies>15);
 console.log('KRK02 opposition certificate:',{roots,firstReplies,secondReplies});
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('partial terminal proof refuses a forged high-margin follow-up context',()=>{
 const st=s('w',[4,2],[2,0],[4,4]);
 const c=krkOppositionCheckChoice(st);
 assert.ok(c);
 assert.equal(c.proofContext.startingMargin,2);
 const after=play(st,c.move);
 const reply=legalMoves(after.board,after.turn)[0];
 assert.ok(reply);
 const s2=play(after,reply);
 assert.equal(krkOppositionFollowChoice(s2,c.proofContext),null);
 assert.equal(krkOppositionFollowChoice(s2,null),null);
});

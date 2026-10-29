import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,opposite,validateSetup}
  from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkColumnKingChoice,auditKRKColumnKing,KRK_COLUMN_KING_LEMMA}
  from '../src/krk-column-king.js';

function board(c,sk,rs,wk){
 const b=makeBoard();b[squareAt(...sk)]=c+'K';b[squareAt(...rs)]=c+'R';
 b[squareAt(...wk)]=opposite(c)+'K';
 return {board:b,turn:c,material:'krk',halfmove:0,log:[],history:[positionKey(b,c)]};
}
function transform(s,frame){
 const b=makeBoard();
 for(let i=0;i<64;i++)if(s.board[i])b[krkTransformSquare(i,frame)]=s.board[i];
 return {...s,board:b,history:[positionKey(b,s.turn)]};
}
test('column step implements exactly the parent file-shift coordinate',()=>{
 const s=board('w',[2,1],[0,2],[5,4]);
 const c=krkColumnKingChoice(s);
 assert.ok(c);
 assert.equal(c.rule,KRK_COLUMN_KING_LEMMA);
 assert.equal(c.move.from,squareAt(2,1));
 assert.equal(c.move.to,squareAt(3,1));
 assert.ok(auditKRKColumnKing(s).ok);
 assert.equal(c.maxMatePlies,null);
});
test('exhaust all legal weak replies for both strong colours and every supported frame',()=>{
 let tried=0,replies=0;
 for(const colour of ['w','b'])for(const frame of KRK_FRAMES)
 for(let sx of [1,2,5,6])
 for(let sy=0;sy<=3;sy++)
 for(let ry=sy+1;ry<=5;ry++)
 for(let wy=ry+1;wy<=7;wy++)
 for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
  if(Math.abs(rx-wx)<3)continue;
  const s=transform(board(colour,[sx,sy],[rx,ry],[wx,wy]),frame);
  if(validateSetup(s.board,'krk',colour))continue;
  const c=krkColumnKingChoice(s,frame);
  assert.ok(c,JSON.stringify({colour,frame,sx,sy,rx,ry,wx,wy}));
  const a=auditKRKColumnKing(s,frame);
  assert.ok(a.ok,JSON.stringify({colour,frame,sx,sy,rx,ry,wx,wy,a}));
  tried++;replies+=a.replies;
 }
 assert.ok(tried>1000&&replies>1000);
 console.log('KRK02 column all-response verification:',{tried,replies});
});
test('column witness is unavailable at central file or insufficient rook safety',()=>{
 assert.equal(krkColumnKingChoice(board('w',[3,1],[0,2],[5,4])),null);
 assert.equal(krkColumnKingChoice(board('w',[2,1],[0,2],[2,4])),null);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

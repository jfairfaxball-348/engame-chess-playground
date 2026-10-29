import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,opposite,positionKey,squareAt} from '../src/chess.js';
import {KRK_GAMEPLAY_RELEASED,KRK_FRAMES,krkTransformSquare} from '../src/krk-local-witness.js';
import {krkLowerBandChoice,krkLowerBandExit,auditKRKLowerBandToExit} from '../src/krk-lower-band.js';
function setup(){
 const b=makeBoard();b[squareAt(3,1)]='wK';b[squareAt(0,2)]='wR';b[squareAt(6,3)]='bK';
 return {board:b,turn:'w',material:'krk',halfmove:0,history:[positionKey(b,'w')],log:[]};
}
test('KRK08 move is proof-extracted and gameplay remains disabled',()=>{
 const s=setup();const c=krkLowerBandChoice(s);
 assert.equal(c?.phase,'king-pursuit');
 assert.equal(c?.kind,'step');
 assert.equal(c?.isCompleteWinningPolicy,false);
 assert.equal(krkLowerBandExit(s),null);
 assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

test('all legal defender replies to lower-band EXIT in both colours and proof frames',()=>{
  let roots=0,leaves=0,maxPairs=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES)
  for(const [king,rook,weak] of [
    [[3,1],[0,2],[6,3]],[[3,1],[0,2],[4,3]],
    [[3,1],[4,2],[5,3]],[[4,1],[7,2],[1,3]]
  ]){
    const b=makeBoard();
    b[squareAt(...king)]=strong+'K';
    b[squareAt(...rook)]=strong+'R';
    b[squareAt(...weak)]=opposite(strong)+'K';
    const board=makeBoard();
    for(let i=0;i<64;i++)if(b[i])board[krkTransformSquare(i,frame)]=b[i];
    const state={board,turn:strong,material:'krk',halfmove:0,
      history:[positionKey(board,strong)],log:[]};
    const a=auditKRKLowerBandToExit(state,frame);
    assert.equal(a.ok,true,JSON.stringify({strong,frame,king,rook,weak,a}));
    assert.ok(a.maxPairs<=5&&a.exitLeaves>0);
    roots++;leaves+=a.exitLeaves;maxPairs=Math.max(maxPairs,a.maxPairs);
  }
  assert.equal(roots,32);
  console.log('KRK08 lower-band to exit',{roots,leaves,maxPairs});
});

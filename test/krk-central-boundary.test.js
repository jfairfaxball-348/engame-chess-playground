import test from 'node:test';
import assert from 'node:assert/strict';
import {
  legalMoves,makeBoard,opposite,play,positionKey,squareAt
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {
  KRK_CENTRAL_ALIGNED_RULE,KRK_CENTRAL_BACK_RULE,
  krkCentralAlignedRescueChoice,krkCentralBackRookChoice,
  krkCentralBoundaryNext,auditKRKCentralAlignedRescue,
  auditKRKCentralBackRook
} from '../src/krk-central-boundary.js';

function root(strong,king,rook,weak){
  const board=makeBoard();
  board[squareAt(...king)]=strong+'K';
  board[squareAt(...rook)]=strong+'R';
  board[squareAt(...weak)]=opposite(strong)+'K';
  return {board,turn:strong,material:'krk',halfmove:0,
    history:[positionKey(board,strong)],log:[]};
}
function frameState(s,f){
  const board=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])
    board[krkTransformSquare(i,f)]=s.board[i];
  return {...s,board,history:[positionKey(board,s.turn)]};
}
test('aligned low-margin central rescue is explicit and all-reply safe in 8 colour/frame combinations',()=>{
  let roots=0,defences=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    for(const sx of [3,4]){
      const s=frameState(root(strong,[sx,1],[sx===3?4:3,2],[sx,3]),frame);
      const witness=krkCentralAlignedRescueChoice(s,frame);
      assert.equal(witness?.rule,KRK_CENTRAL_ALIGNED_RULE);
      assert.equal(witness?.kind,'step');
      assert.equal(witness.isCompleteWinningPolicy,false);
      const a=auditKRKCentralAlignedRescue(s,frame);
      assert.equal(a.ok,true,JSON.stringify({strong,frame,sx,a}));
      assert.ok(a.replies>0);
      const p=play(s,witness.move);
      assert.equal(p.history.length,s.history.length+1);
      assert.equal(p.halfmove,1);
      assert.equal(krkCentralBoundaryNext(s,frame).phase,'central-aligned-rook-rescue');
      for(const reply of legalMoves(p.board,p.turn)){
        const child=play(p,reply);
        assert.equal(child.history.length,s.history.length+2);
        assert.equal(child.halfmove,2);
        // The all-defender result reaches another legal central-wall
        // position; it is NOT proof that the downstream selector mates.
        const follow=krkCentralBoundaryNext(child,frame);
        assert.ok(follow?.kind==='step'||follow?.kind==='handoff');
        assert.equal(follow.isCompleteWinningPolicy,false);
        defences++;
      }
      roots++;
    }
  }
  assert.equal(roots,16);
  assert.ok(defences>=16);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('central READY branch delegates to existing frozen local extraction',()=>{
  const s=root('w',[3,1],[0,2],[3,3]);
  const ready=krkCentralBoundaryNext(s);
  assert.equal(ready?.phase,'ready-aligned-check');
  assert.equal(ready?.kind,'step');
  assert.equal(ready?.isCompleteWinningPolicy,false);
  assert.equal(krkCentralAlignedRescueChoice(s),null);
});
test('invalid central geometry, false history and clock claims fail closed',()=>{
  const missing=root('w',[3,1],[4,1],[5,3]);
  assert.equal(krkCentralBoundaryNext(missing),null);
  const s=root('w',[3,1],[4,2],[3,3]);
  assert.equal(krkCentralBoundaryNext({...s,history:[]}),null);
  assert.equal(krkCentralBoundaryNext({...s,history:['forged']}),null);
  assert.equal(krkCentralAlignedRescueChoice({...s,halfmove:98}),null);
  const k=positionKey(s.board,s.turn);
  assert.equal(krkCentralAlignedRescueChoice({...s,history:[k,k,k]}),null);
  assert.equal(krkCentralBoundaryNext({...s,material:'knk'}),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

test('nonaligned narrow-rook margin follows exact oriented back-file source for every defender',()=>{
  let checked=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    for(const setup of [
      {king:[3,1],rook:[4,2],weak:[5,3],target:0},
      {king:[4,1],rook:[3,2],weak:[2,3],target:7},
      {king:[3,1],rook:[3,2],weak:[4,3],target:0},
      {king:[4,1],rook:[4,2],weak:[3,3],target:7}
    ]){
      const s=frameState(root(strong,setup.king,setup.rook,setup.weak),frame);
      const choice=krkCentralBackRookChoice(s,frame);
      assert.equal(choice?.rule,KRK_CENTRAL_BACK_RULE,
        JSON.stringify({strong,frame,setup}));
      assert.equal(krkTransformSquare(choice.move.to,frame)%8,setup.target);
      assert.equal(krkCentralBoundaryNext(s,frame)?.phase,'central-oriented-back-rook');
      const audit=auditKRKCentralBackRook(s,frame);
      assert.equal(audit.ok,true,JSON.stringify({strong,frame,setup,audit}));
      assert.ok(audit.replies>0);
      const after=play(s,choice.move);
      for(const reply of legalMoves(after.board,after.turn)){
        const child=play(after,reply);
        assert.equal(child.history.length,s.history.length+2);
        assert.equal(child.halfmove,2);
      }
      checked++;
    }
  }
  assert.equal(checked,32);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  legalMoves,makeBoard,opposite,play,positionKey,squareAt
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkOppositionCheckChoice}
  from '../src/krk-opposition.js';
import {
  krkRestorationChainNext,auditKRKRestorationChain
} from '../src/krk-restoration-chain.js';

function root(strong,king,rook,weak){
  const board=makeBoard();
  board[squareAt(...king)]=strong+'K';
  board[squareAt(...rook)]=strong+'R';
  board[squareAt(...weak)]=opposite(strong)+'K';
  return {board,turn:strong,material:'krk',halfmove:0,
    history:[positionKey(board,strong)],log:[]};
}
function transform(s,frame){
  const board=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])
    board[krkTransformSquare(i,frame)]=s.board[i];
  return {...s,board,history:[positionKey(board,s.turn)]};
}
test('aligned Kd2/Ra3 vs Kd4 restoration exhausts all replies and reaches central wall',()=>{
  let initialDefences=0,leaves=0,replies=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=transform(root(strong,[3,1],[0,2],[3,3]),frame);
    const check=krkOppositionCheckChoice(s,frame);
    assert.ok(check);
    const after=play(s,check.move);
    for(const defender of legalMoves(after.board,after.turn)){
      initialDefences++;
      const restored=play(after,defender);
      const next=krkRestorationChainNext(restored,frame);
      assert.equal(next?.kind,'step');
      const audit=auditKRKRestorationChain(restored,frame);
      assert.equal(audit.ok,true,JSON.stringify({strong,frame,defender,audit}));
      assert.ok(audit.centralLeaves>0);
      assert.ok(audit.maxPairs>=1&&audit.maxPairs<=3);
      assert.equal(audit.terminal,'central-wall handoff, not checkmate');
      assert.equal(audit.isCompleteWinningPolicy,false);
      assert.equal(audit.maxMatePlies,null);
      leaves+=audit.centralLeaves;
      replies+=audit.examinedReplies;
    }
  }
  assert.ok(initialDefences>=16);
  assert.ok(leaves>=initialDefences);
  assert.ok(replies>=leaves);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  console.log('KRK05 restored central diagnostics',{initialDefences,leaves,replies});
});
test('both rescue and central alignment paths remain source-guarded',()=>{
  const far=root('w',[3,1],[0,3],[2,4]);
  assert.equal(krkRestorationChainNext(far)?.phase,'restoration-rook-rescue');
  assert.equal(auditKRKRestorationChain(far).ok,true);
  const king=root('w',[1,1],[0,3],[4,4]);
  assert.equal(krkRestorationChainNext(king)?.phase,'restoration-king-catch-up');
  assert.equal(auditKRKRestorationChain(king).ok,true);
  const centre=root('w',[2,2],[0,3],[4,4]);
  assert.equal(krkRestorationChainNext(centre)?.phase,'restoration-centre-align');
  assert.equal(auditKRKRestorationChain(centre).ok,true);
  const done=root('w',[3,2],[0,3],[4,4]);
  assert.equal(krkRestorationChainNext(done)?.kind,'handoff');
  assert.equal(auditKRKRestorationChain(done).maxPairs,0);
});
test('rejects incomplete geometry, false history, and FIDE claim windows',()=>{
  const s=root('w',[3,1],[0,3],[2,4]);
  assert.equal(krkRestorationChainNext({...s,history:[]}),null);
  assert.equal(auditKRKRestorationChain({...s,history:[]}).ok,false);
  const fake={...s,history:[positionKey(s.board,'b')]};
  assert.equal(krkRestorationChainNext(fake),null);
  assert.equal(auditKRKRestorationChain({...s,halfmove:94}).ok,false);
  assert.match(auditKRKRestorationChain({...s,halfmove:94}).reason,/50-move/);
  const claim={...s,history:Array(3).fill(positionKey(s.board,'w'))};
  assert.equal(auditKRKRestorationChain(claim).ok,false);
  assert.match(auditKRKRestorationChain(claim).reason,/threefold/);
  assert.equal(krkRestorationChainNext({...s,material:'kk'}),null);
  const outside=root('w',[0,0],[0,3],[4,4]);
  assert.equal(krkRestorationChainNext(outside),null);
});

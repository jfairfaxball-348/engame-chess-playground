import test from 'node:test';
import assert from 'node:assert/strict';
import {
  legalMoves,makeBoard,opposite,outcome,play,positionKey,squareAt,validateSetup
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkOppositionCheckChoice} from '../src/krk-opposition.js';
import {krkRestorationFirstChoice,auditKRKRestorationFirst}
  from '../src/krk-restoration-first.js';

function position(strong,sk,rook,wk){
  const board=makeBoard();
  board[squareAt(...sk)]=strong+'K';
  board[squareAt(...rook)]=strong+'R';
  board[squareAt(...wk)]=opposite(strong)+'K';
  return {board,turn:strong,material:'krk',halfmove:0,
    history:[positionKey(board,strong)],log:[]};
}
function mapped(s,frame){
  const board=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])
    board[krkTransformSquare(i,frame)]=s.board[i];
  return {...s,board,history:[positionKey(board,s.turn)]};
}

test('original aligned gap-three check enters one of two exact restoration actions after every defence',()=>{
  let firstDefences=0,secondDefences=0,farReentry=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const root=mapped(position(strong,[3,1],[0,2],[3,3]),frame);
    assert.equal(validateSetup(root.board,'krk',strong),null);
    const check=krkOppositionCheckChoice(root,frame);
    assert.ok(check,JSON.stringify({strong,frame}));
    const checked=play(root,check.move);
    assert.equal(outcome(checked.board,checked.turn,checked.history,checked.halfmove).kind,'ongoing');
    for(const reply of legalMoves(checked.board,checked.turn)){
      const defended=play(checked,reply);
      firstDefences++;
      const rescue=krkRestorationFirstChoice(defended,frame);
      assert.equal(rescue?.kind,'step',JSON.stringify({strong,frame,reply}));
      assert.match(rescue.rule,/restoration(Far|King)_sound/);
      assert.equal(rescue.isCompleteWinningPolicy,false);
      assert.equal(rescue.maxMatePlies,null);
      assert.equal(auditKRKRestorationFirst(defended,frame).ok,true,
        JSON.stringify({strong,frame,reply}));
      const after=play(defended,rescue.move);
      for(const secondReply of legalMoves(after.board,after.turn)){
        const later=play(after,secondReply);
        secondDefences++;
        if(rescue.ruleKey==='far'){
          const next=krkRestorationFirstChoice(later,frame);
          assert.equal(next?.ruleKey,'king',
            JSON.stringify({strong,frame,reply,secondReply}));
          assert.equal(auditKRKRestorationFirst(later,frame).ok,true);
          farReentry++;
        }
      }
    }
  }
  assert.ok(firstDefences>=16);
  assert.ok(secondDefences>=32);
  assert.ok(farReentry>=8);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  console.log('KRK05 check/restoration diagnostic:',{firstDefences,secondDefences,farReentry});
});

test('restoration is strictly scoped to actual strong-turn wall and correct history',()=>{
  const s=position('w',[3,1],[0,3],[2,4]);
  assert.equal(krkRestorationFirstChoice(s)?.ruleKey,'far');
  assert.equal(auditKRKRestorationFirst(s).ok,true);
  const wide=position('w',[3,1],[0,3],[4,4]);
  assert.equal(krkRestorationFirstChoice(wide)?.ruleKey,'king');
  assert.equal(auditKRKRestorationFirst(wide).ok,true);
  const weak={...s,turn:'b',history:[positionKey(s.board,'b')]};
  assert.equal(krkRestorationFirstChoice(weak),null);
  const expired={...s,halfmove:150};
  assert.equal(krkRestorationFirstChoice(expired),null);
  const wrong={...s,material:'knk'};
  assert.equal(krkRestorationFirstChoice(wrong),null);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  legalMoves,makeBoard,opposite,play,positionKey,squareAt
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkRestorationFirstChoice,auditKRKRestorationFirst}
  from '../src/krk-restoration-first.js';
import {krkRestorationCentreChoice,auditKRKRestorationCentre}
  from '../src/krk-restoration-centre.js';

function root(strong){
  const b=makeBoard();b[squareAt(1,1)]=strong+'K';
  b[squareAt(0,3)]=strong+'R';
  b[squareAt(4,4)]=opposite(strong)+'K';
  return {board:b,turn:strong,material:'krk',
    history:[positionKey(b,strong)],halfmove:0,log:[]};
}
function transform(state,f){
  const b=makeBoard();
  for(let i=0;i<64;i++)if(state.board[i])
    b[krkTransformSquare(i,f)]=state.board[i];
  return {...state,board:b,history:[positionKey(b,state.turn)]};
}

test('king-catch-up then centre-align, with all defender replies in both colours and four frames',()=>{
  let first=0,second=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const start=transform(root(strong),frame);
    const catchUp=krkRestorationFirstChoice(start,frame);
    assert.equal(catchUp?.ruleKey,'king');
    assert.equal(auditKRKRestorationFirst(start,frame).ok,true);
    const after=play(start,catchUp.move);
    for(const reply of legalMoves(after.board,after.turn)){
      const defended=play(after,reply);first++;
      const centre=krkRestorationCentreChoice(defended,frame);
      assert.equal(centre?.kind,'step',JSON.stringify({strong,frame,reply}));
      assert.match(centre.rule,/restorationCentre_sound/);
      assert.equal(auditKRKRestorationCentre(defended,frame).ok,true);
      const next=play(defended,centre.move);
      for(const response of legalMoves(next.board,next.turn)){
        const following=play(next,response);second++;
        assert.equal(following.turn,strong);
      }
    }
  }
  assert.ok(first>=8);
  assert.ok(second>=16);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  console.log('KRK05 second restoration pair:',{first,second});
});

test('second restoration phase fails closed outside certified geometry',()=>{
  const s=root('w');
  assert.equal(krkRestorationCentreChoice(s),null); // file b, not c/f
  const c={...s,board:s.board.slice()};
  c.board[squareAt(1,1)]=null;c.board[squareAt(2,1)]='wK';
  c.history=[positionKey(c.board,'w')];
  assert.equal(krkRestorationCentreChoice(c)?.kind,'step');
  assert.equal(auditKRKRestorationCentre(c).ok,true);
  assert.equal(krkRestorationCentreChoice({...c,halfmove:150}),null);
});

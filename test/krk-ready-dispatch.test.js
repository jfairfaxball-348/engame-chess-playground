import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyMove,legalMoves,makeBoard,opposite,positionKey,squareAt,validateSetup
} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkReadyDispatch,auditKRKReadyDispatch}
  from '../src/krk-ready-dispatch.js';

function root(strong,sk,rook,wk){
  const b=makeBoard();
  b[squareAt(...sk)]=strong+'K';
  b[squareAt(...rook)]=strong+'R';
  b[squareAt(...wk)]=opposite(strong)+'K';
  return {board:b,turn:strong,material:'krk',
    halfmove:0,history:[positionKey(b,strong)],log:[]};
}
function mapped(s,f){
  const b=makeBoard();
  for(let i=0;i<64;i++)if(s.board[i])
    b[krkTransformSquare(i,f)]=s.board[i];
  return {...s,board:b,history:[positionKey(b,s.turn)]};
}

test('READY branch table selects only source-named locally proved moves',()=>{
  const cases=[
    {phase:'ready-upper',sk:[3,1],rook:[0,2],wk:[5,4]},
    {phase:'ready-narrow-tempo',sk:[3,1],rook:[0,2],wk:[4,3]},
    {phase:'ready-aligned-check',sk:[3,1],rook:[0,2],wk:[3,3]},
    {phase:'ready-wide-pivot',sk:[3,1],rook:[0,2],wk:[5,3]},
    {phase:'guarded-cut',sk:[3,1],rook:[4,2],wk:[5,3]}
  ];
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES)
    for(const example of cases){
      const s=mapped(root(strong,example.sk,example.rook,example.wk),frame);
      assert.equal(validateSetup(s.board,'krk',strong),null);
      const c=krkReadyDispatch(s,frame);
      assert.equal(c?.phase,example.phase,JSON.stringify({strong,frame,example,c}));
      assert.equal(c?.kind,'step');
      assert.ok(c.rule?.startsWith('EndgameChess.Rules.'),
        JSON.stringify({strong,frame,example,c}));
      assert.equal(c.isCompleteWinningPolicy,false);
      assert.equal(c.maxMatePlies,null);
      const a=auditKRKReadyDispatch(s,frame);
      assert.ok(a.ok,JSON.stringify({strong,frame,example,a}));
      assert.ok(a.replies>0);
    }
});

test('aligned READY selects only the proved checking rook slide and audits every defence',()=>{
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES)
    for(const rookFile of [1,0,7]){
      // Margin 2/3 admits the first check but NOT a certified four-file
      // king-up continuation; margin 4 admits the separately proved follow.
      const margin=Math.abs(rookFile-3);
      const s=mapped(root(strong,[3,1],[rookFile,2],[3,3]),frame);
      assert.equal(validateSetup(s.board,'krk',strong),null);
      const c=krkReadyDispatch(s,frame);
      assert.equal(c?.kind,'step');
      assert.equal(c.phase,'ready-aligned-check');
      assert.match(c.rule,/oppositionCheck_sound/);
      assert.equal(c.maxMatePlies,null);
      assert.equal(c.isCompleteWinningPolicy,false);
      assert.equal(c.move.to,krkTransformSquare(squareAt(rookFile,3),frame));
      const audit=auditKRKReadyDispatch(s,frame);
      assert.equal(audit.ok,true,JSON.stringify({strong,frame,rookFile,audit}));
      assert.equal(audit.local.followCertified,margin>=4);
      // Exhaust the *actual* defender replies on the owner-arranged board,
      // not a fabricated board/weak-turn position.
      const checked=applyMove(s.board,c.move);
      const responses=legalMoves(checked,opposite(strong));
      assert.ok(responses.length>0);
      for(const reply of responses){
        assert.equal(reply.capture,null);
        const defended=applyMove(checked,reply);
        const wk=defended.indexOf(opposite(strong)+'K');
        const framedWk=krkTransformSquare(wk,frame);
        assert.ok([squareAt(2,4),squareAt(3,4),squareAt(4,4)]
          .includes(framedWk),JSON.stringify({strong,frame,rookFile,reply}));
      }
    }
});

test('wide pivot is followed by a guarded move after EVERY legal weak reply',()=>{
  let responses=0;
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES){
    const s=mapped(root(strong,[3,1],[0,2],[5,3]),frame);
    const pivot=krkReadyDispatch(s,frame);
    assert.equal(pivot?.phase,'ready-wide-pivot');
    const next=applyMove(s.board,pivot.move);
    const defending=legalMoves(next,opposite(strong));
    assert.ok(defending.length>0);
    for(const reply of defending){
      const after=applyMove(next,reply);
      const strongState={...s,board:after,turn:strong,
        halfmove:s.halfmove+2,
        history:s.history.concat([positionKey(next,opposite(strong)),
          positionKey(after,strong)])};
      const guarded=krkReadyDispatch(strongState,frame);
      assert.equal(guarded?.phase,'guarded-cut',
        JSON.stringify({strong,frame,reply,guarded}));
      assert.equal(guarded?.kind,'step');
      assert.ok(auditKRKReadyDispatch(strongState,frame).ok,
        JSON.stringify({strong,frame,reply,guarded}));
      responses++;
    }
  }
  assert.ok(responses>=8);
});

test('outside READY or a proved guard, missing move is not silently replaced',()=>{
  const nonReady=root('w',[1,0],[0,2],[5,5]);
  assert.equal(krkReadyDispatch(nonReady),null);
  const weak=root('w',[3,1],[0,2],[5,3]);
  weak.turn='b';weak.history=[positionKey(weak.board,'b')];
  assert.equal(krkReadyDispatch(weak),null);
  const overClock=root('w',[3,1],[0,2],[5,3]);
  overClock.halfmove=150;
  assert.equal(krkReadyDispatch(overClock),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});

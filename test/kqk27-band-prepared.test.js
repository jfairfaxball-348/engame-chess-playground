import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,legalMoves,opposite,squareAt,validateSetup
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// Frozen KQK BandProgress.prepared_king_step and prepared_queen_step:
// each source move uses mateWithin_pair and proves Prepared in the ORIGINAL
// source frame after EVERY legal weak reply. The token is one-reply-only.
const frames=[
  ([x,y])=>[x,y],([x,y])=>[7-x,y],([x,y])=>[x,7-y],
  ([x,y])=>[7-x,7-y],([x,y])=>[y,x],([x,y])=>[7-y,7-x],
  ([x,y])=>[7-y,x],([x,y])=>[y,7-x]
];
const fixtures=[
  {king:[2,1],queen:[2,2],weak:[6,7],
    source:'KQK.BandProgress.prepared_king_step'},
  {king:[4,2],queen:[2,3],weak:[5,7],
    source:'KQK.BandProgress.prepared_queen_step'}
];

test('S027 BandProgress keeps each proved Prepared continuation for all weak replies, both colours and frames',()=>{
  const counts=new Map();
  for(const fixture of fixtures)for(const strong of ['w','b'])for(const frame of frames){
    const at=([x,y])=>squareAt(...frame([x,y]));
    const b=makeBoard(),weak=opposite(strong);
    b[at(fixture.king)]=strong+'K';
    b[at(fixture.queen)]=strong+'Q';
    b[at(fixture.weak)]=weak+'K';
    assert.equal(validateSetup(b,'kqk',strong),null);
    const state=newGame(b,strong,'kqk',{experimentalKQK:true});
    const first=chooseMathsOpponent(state,strong);
    // Another exact source theorem can take priority in a reflected frame.
    // Only test the BandProgress source composition when dispatched.
    if(first?.sourcePhase!==fixture.source)continue;
    const key=fixture.source+' '+strong;
    counts.set(key,(counts.get(key)||0)+1);
    assert.equal(first.continuationToken?.kind,'band-prepared');
    const after=mathsPlayMove(state,first.move);
    assert.equal(chooseMathsOpponent(after,strong,first.continuationToken),null,
      'token cannot be consumed on a weak turn');
    const replies=legalMoves(after.board,weak);
    assert.ok(replies.length>0);
    for(const reply of replies){
      const next=mathsPlayMove(after,reply);
      const chosen=chooseMathsOpponent(next,strong,first.continuationToken);
      assert.ok(chosen?.move,
        'Lean Prepared invariant must license a fixed-frame source action after '+reply.from+'-'+reply.to);
      assert.ok(['BandProgress','BandRaise','RankFive','BandEntry'].some(p=>
        chosen.sourcePhase.startsWith('KQK.'+p+'.')),chosen.sourcePhase);
      assert.ok(legalMoves(next.board,strong).some(m=>
        m.from===chosen.move.from&&m.to===chosen.move.to));
      assert.equal(chooseMathsOpponent(next,strong,{
        ...first.continuationToken,weak:reply.to
      }),null,'forged original weak-square must not be accepted');
      assert.equal(chooseMathsOpponent(next,strong,{
        ...first.continuationToken,moveCount:first.continuationToken.moveCount-1
      }),null,'wrong move count must be rejected');
    }
  }
  for(const f of fixtures)for(const strong of ['w','b'])
    assert.ok((counts.get(f.source+' '+strong)||0)>0,
      'fixture must exercise '+f.source+' with '+strong);
});

test('S027 first capped S025 WeakToMove path is resource-limited, not missing a prepared-band move',()=>{
  // Reproducible first cap: white K44 Q32, black K12, white to move,
  // reached from K48 Q32 vs K35 after a legal sequence of weak replies.
  const board=makeBoard();board[44]='wK';board[32]='wQ';board[12]='bK';
  assert.equal(validateSetup(board,'kqk','w'),null);
  const state=newGame(board,'w','kqk',{experimentalKQK:true});
  const first=chooseMathsOpponent(state,'w');
  assert.equal(first?.sourcePhase,'KQK.BandProgress.prepared_queen_step');
  assert.equal(first.move.from,32);
  assert.equal(first.move.to,35);
  assert.equal(first.continuationToken?.kind,'band-prepared');
  const after=mathsPlayMove(state,first.move);
  const replies=legalMoves(after.board,'b');
  assert.ok(replies.length>0);
  for(const move of replies){
    const next=mathsPlayMove(after,move);
    assert.ok(chooseMathsOpponent(next,'w',first.continuationToken)?.move,
      'the original Prepared frame must survive every weak reply');
  }
  // This proves only a specific source step and its immediate all-reply
  // continuation. It does not certify the full capped game tree.
});

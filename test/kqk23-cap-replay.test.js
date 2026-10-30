import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeBoard,newGame,validateSetup,opposite,legalMoves,positionKey
} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

// First KQK cap trajectory from S022 main (run 41053929263).
// Retaining the ACTUAL user-arranged weak-turn root and every legal
// defender/source half-move makes a deep audit cap independently replayable.
// A node cap is NOT a strategy failure and NOT evidence of mate.
const root={king:48,queen:32,weak:35,strong:'w',turn:'b'};
const trajectory=[
  ['defender',35,28,null],
  ['source',48,40,'KQK.BandEntry.wall_prepare_bound.vertical'],
  ['defender',28,29,null],
  ['source',40,41,'KQK.BandProgress.prepared_king_step'],
  ['defender',29,30,null],
  ['source',41,42,'KQK.BandProgress.prepared_king_step'],
  ['defender',30,22,null],
  ['source',42,43,'KQK.BandProgress.prepared_king_step'],
  ['defender',22,29,null],
  ['source',43,44,'KQK.BandProgress.prepared_king_step'],
  ['defender',29,28,null],
  ['source',32,35,'KQK.BandProgress.prepared_queen_step'],
  ['defender',28,29,null],
  ['source',35,36,'KQK.BandProgress.prepared_queen_step']
];
test('S023 replays a real KQK capped adversarial branch without claiming mate',()=>{
  const b=makeBoard();
  b[root.king]='wK';b[root.queen]='wQ';b[root.weak]='bK';
  assert.equal(validateSetup(b,'kqk',root.turn),null);
  let state=newGame(b,root.turn,'kqk',{experimentalKQK:true}),token=null;
  for(const [actor,from,to,phase] of trajectory){
    const chosen=actor==='source'?chooseMathsOpponent(state,root.strong,token):null;
    const move=actor==='source'?chosen?.move:
      legalMoves(state.board,opposite(root.strong)).find(m=>m.from===from&&m.to===to);
    assert.ok(move,'replay failed on '+actor+' '+from+'-'+to);
    assert.equal(move.from,from);
    assert.equal(move.to,to);
    if(actor==='source'){
      assert.equal(chosen.sourcePhase,phase);
      token=chosen.continuationToken;
    }
    state=mathsPlayMove(state,move);
  }
  assert.equal(state.turn,opposite(root.strong));
  assert.equal(state.history.at(-1),positionKey(state.board,state.turn));
  assert.ok(legalMoves(state.board,state.turn).length>0);
  // The reproduced state is merely the first bounded-search cap.
  // A follow-up can analyse all weak replies here without re-running
  // the 1200-node tree just to discover this precise board position.
});

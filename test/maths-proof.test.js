import test from 'node:test';
import assert from 'node:assert/strict';
import {blankBoard,setupVerdict} from '../src/maths-model.js';
import {proofFor} from '../src/maths-proof.js';
import {newGame,squareAt} from '../src/chess.js';
import {readFileSync} from 'node:fs';
const sq=squareAt;
const make=(extra=null)=>{
 const b=blankBoard();
 b[sq(1,5)]='wK'; b[sq(7,5)]='bK';
 if(extra)b[sq(0,5)]=extra;
 return b;
};
test('starting from an arranged position copies every exact piece and turn',()=>{
 for(const [extra,material] of [[null,'kk'],['wB','kbk'],['wN','knk'],['bN','knk']]){
  const b=make(extra);
  for(const turn of ['w','b']){
   const v=setupVerdict(b,turn);
   assert.equal(v.canStart,true);
   const snapshot=b.slice(),game=newGame(b,turn,material);
   assert.deepEqual(game.board,snapshot);
   assert.notEqual(game.board,b,'game must copy the setup');
   assert.equal(game.turn,turn);
   assert.equal(game.log.length,0,'no move has yet happened');
   assert.equal(game.history.length,1);
  }
 }
});
test('KK proof derives distance, legality invariant, universal non-mate and draw',()=>{
 const p=proofFor(make(),'w');
 assert.equal(p.source,'EC-T0003');
 assert.match(p.working,/max\(\|Δfile\|, \|Δrank\|\)/);
 assert.ok(p.steps.some(s=>s.math.includes('Reach(p)')));
 assert.ok(p.steps.some(s=>s.math.includes('Dead(p)')));
});
test('KBK proof shows computed square parity, guaranteed escape and capture reduction',()=>{
 const b=make('wB'),p=proofFor(b,'w');
 assert.equal(p.source,'EC-T0004');
 assert.match(p.working,/a6/);
 assert.match(p.working,/light square/);
 assert.ok(p.steps.some(s=>s.math.includes('χ(h)')));
 assert.ok(p.steps.some(s=>s.math.includes('Capture(B)')));
 assert.match(p.sourceUrl,/EC-T0004\/v1\.md$/);
});
test('KNK proof uses corrected orthogonal-neighbour parity argument',()=>{
 const p=proofFor(make('wN'),'w');
 assert.equal(p.source,'EC-T0005');
 assert.ok(p.steps.some(s=>s.math.includes('χ(h)')));
 assert.ok(p.steps.some(s=>s.why.includes('knight cannot attack')));
 assert.ok(p.steps.some(s=>s.math.includes('legal escape')));
});
test('KRK proof shows positional safety condition and both mate bounds without adding engine',()=>{
 const p=proofFor(make('wR'),'w');
 assert.equal(p.source,'EC-T0048');
 assert.match(p.working,/rook defended/);
 assert.ok(p.steps.some(s=>s.math.includes('97')));
 assert.ok(p.steps.some(s=>s.math.includes('98')));
 assert.ok(p.steps.some(s=>s.math.includes('SafeRook')));
});
test('an exact one-ply KRK witness is explained without enabling gameplay',()=>{
 const b=blankBoard();
 b[sq(1,5)]='wK';b[sq(7,0)]='wR';b[sq(0,7)]='bK';
 const result=setupVerdict(b,'w'),p=proofFor(b,'w');
 assert.equal(result.kind,'win');
 assert.equal(result.canStart,false,'a local mate witness must not unlock the full game');
 assert.equal(p.source,'EC-T0048');
 assert.equal(p.auxSource,'EC-T0049');
 assert.match(p.auxSourceUrl,/EC-T0049\/v1\.md$/);
 assert.match(p.working,/MateNow = true/);
 assert.match(p.working,/Rh1 → h8#/);
 assert.ok(p.steps.some(s=>s.math.includes('MateNow')&&s.why.includes('immediate_iff')));
 assert.match(p.lead,/Full KRK gameplay remains gated/);
 const weak=proofFor(b,'b');
 assert.ok(weak,'weak-to-move on the same setup is a distinct legal condition');
 assert.equal(weak.auxSource,undefined,'only a strong-turn immediate mating move may be displayed');
});

test('weak-turn frozen LastReply proof explains every legal mate-in-two branch but does not start KRK',()=>{
 const b=blankBoard();
 b[sq(1,5)]='wK'; b[sq(7,0)]='wR'; b[sq(0,7)]='bK';
 const verdict=setupVerdict(b,'b'),p=proofFor(b,'b');
 assert.equal(verdict.canStart,false);
 assert.equal(verdict.kind,'win');
 assert.equal(p.source,'EC-T0048');
 assert.equal(p.auxSource,'EC-T0049');
 assert.match(p.lead,/mate in at most two plies after EVERY legal weak-king reply/);
 assert.match(p.working,/LastReply = true/);
 assert.match(p.working,/bound ≤2 plies/);
 assert.ok(p.steps.some(s=>s.math.includes('LastReply(K,R,k)')&&s.math.includes('MateWithinσ(2)')));
 assert.match(p.formal,/KRKLastReply.model_last_iff/);
});

test('incomplete or invalid boards cannot be represented as a completed theorem',()=>{
 assert.equal(proofFor(blankBoard(),'w'),null);
 const b=blankBoard();b[sq(4,0)]='wK';b[sq(5,0)]='bK';
 assert.equal(proofFor(b,'w'),null);
});
test('starting orientation and first move are opt-in in the Maths runtime',()=>{
 const app=readFileSync('src/maths-app.js','utf8');
 assert.match(app,/openingPending=game\.turn!==human/);
 assert.match(app,/openingPending=false;opponent\(\)/);
 assert.match(app,/history\.push\(save\(\)\);openingPending=false/);
 assert.match(app,/id="maths-first"/);
 assert.doesNotMatch(app,/facing=human/);
 assert.match(app,/proofMarkup\(current\(\),playing\?game\.turn:turn\)/);
});

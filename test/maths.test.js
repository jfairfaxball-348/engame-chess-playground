import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {blankBoard,INVENTORY,available,put,relocate,materialOf,setupVerdict} from '../src/maths-model.js';
import {squareAt} from '../src/chess.js';
const sq=squareAt;
function position(extra){
 const b=blankBoard();b[sq(4,0)]='wK';b[sq(4,7)]='bK';if(extra)b[sq(0,0)]=extra;return b;
}
test('all sixteen normal chess pieces per side are visible in the tray',()=>{
 assert.equal(INVENTORY.length,16);
 for(const type of ['R','N','B'])assert.equal(INVENTORY.filter(x=>x===type).length,2);
 assert.equal(INVENTORY.filter(x=>x==='P').length,8);
});
test('only two kings plus at most one bishop, knight or rook can be arranged',()=>{
 let b=blankBoard();
 for(const side of ['w','b'])for(const piece of ['K','B','N','R'])assert.ok(available(b,side+piece));
 for(const side of ['w','b'])for(const piece of ['Q','P'])assert.equal(available(b,side+piece),false);
 b=put(b,'wB',4);assert.equal(materialOf(b),'kbk');
 for(const side of ['w','b'])for(const piece of ['B','N','R'])assert.equal(available(b,side+piece),false);
 assert.equal(available(b,'bK'),true);
 assert.equal(put(b,'wK',4),null);
 b=relocate(b,4,-1);assert.equal(materialOf(b),'kk');
 assert.equal(available(b,'bR'),true);
});
test('king inventory cannot duplicate one colour',()=>{
 const b=put(blankBoard(),'wK',4);
 assert.equal(available(b,'wK'),false);
 assert.equal(put(b,'bK',4),null);
 assert.equal(relocate(b,4,4),null);
});
test('dead material classes are proved draws and playable as the weaker side',()=>{
 for(const extra of [null,'wB','wN','bN']){
  const b=position(extra),v=setupVerdict(b,'w');
  assert.equal(v.kind,'draw');assert.equal(v.canStart,true);
  assert.equal(v.human,extra?(extra[0]==='w'?'b':'w'):'w');
 }
});
test('KRK classifies fresh roots and does not pretend to have an executable certified policy',()=>{
 const b=position('wR');
 const v=setupVerdict(b,'w');
 assert.equal(v.title,'Winning for White');assert.equal(v.source,'EC-T0048');
 assert.equal(v.human,'b');assert.equal(v.canStart,true);assert.equal(v.experimental,true);
 assert.equal(v.strategyPending,false);
});
test('weak king captures an exposed rook: draw according to KRK criterion',()=>{
 const b=blankBoard();b[sq(4,0)]='wK';b[sq(4,6)]='bK';b[sq(4,5)]='wR';
 const v=setupVerdict(b,'b');assert.equal(v.kind,'draw');assert.equal(v.safeRook,false);
});
test('invalid positions never activate the Start game action',()=>{
 const b=blankBoard();assert.equal(setupVerdict(b,'w').canStart,false);
 b[sq(4,0)]='wK';b[sq(5,0)]='bK';
 assert.equal(setupVerdict(b,'w').canStart,false);
});
test('maths app is isolated from stockfish, lozza and the independent arena',()=>{
 const html=readFileSync('index.html','utf8');
 assert.match(html,/\/src\/maths-app\.js/);
 assert.match(html,/\/src\/arena-app\.js/);
 assert.match(html,/\/src\/maths\.css/);
 const src=readFileSync('src/maths-app.js','utf8');
 assert.doesNotMatch(src,/stockfish|lozza|\bfetch\s*\(|\bWebSocket\s*\(/i);
 assert.match(src,/data-slot/);
 assert.match(src,/pointerdown/);
});

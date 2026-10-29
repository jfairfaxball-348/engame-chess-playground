import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,opposite,positionKey,squareAt} from '../src/chess.js';
import {KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {krkLowerBandChoice,krkLowerBandExit} from '../src/krk-lower-band.js';
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

import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,positionKey} from '../src/chess.js';
import {kqk30ControlShape} from '../scripts/kqk30-state-key.mjs';

test('S030 KQK token-aware diagnostic distinguishes source phases on same board',()=>{
  const board=makeBoard();
  board[7]='wK';board[58]='wQ';board[9]='bK';
  const state={board,turn:'w'};
  const bare=kqk30ControlShape(state,'w',null);
  const token={kind:'band-wall-prepare',frame:'id',strong:'w',
    queen:58,king:7,weak:9,moveCount:10,rankBefore:4};
  const first=kqk30ControlShape(state,'w',token);
  assert.notEqual(first,bare);
  assert.notEqual(first,kqk30ControlShape(state,'w',{
    ...token,kind:'band-prepared'
  }));
  assert.notEqual(first,kqk30ControlShape(state,'w',{
    ...token,rankBefore:3
  }), 'source induction potential is essential to controller identity');
  assert.equal(first,kqk30ControlShape(state,'w',{
    ...token,moveCount:70
  }), 'monotone provenance length must not hide structural recurrence');
  assert.notEqual(first,kqk30ControlShape(
    {...state,turn:'b'},'w',token));
  assert.notEqual(first,kqk30ControlShape(state,'b',token));
  assert.ok(first.includes(positionKey(board,'w')));
});

test('S030 object key order cannot spuriously change the source state key',()=>{
  const board=makeBoard();
  board[7]='wK';board[58]='wQ';board[9]='bK';
  const state={board,turn:'w'};
  const token={kind:'band-wall-prepare',frame:'id',
    king:7,queen:58,moveCount:11,rankBefore:4};
  const reordered={rankBefore:4,queen:58,moveCount:12,
    frame:'id',kind:'band-wall-prepare',king:7};
  assert.equal(kqk30ControlShape(state,'w',token),
    kqk30ControlShape(state,'w',reordered));
});

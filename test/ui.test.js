import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pieceSVG, pieceLabel } from '../src/pieces.js';
import { squareAtPoint, squareForCell } from '../src/board-ui.js';

test('all board orientations map exactly 64 unique squares',()=>{
  for(const colour of ['w','b']){
    const squares=Array.from({length:64},(_,i)=>squareForCell(Math.floor(i/8),i%8,colour));
    assert.deepEqual([...squares].sort((a,b)=>a-b),Array.from({length:64},(_,i)=>i));
    assert.equal(squareForCell(0,0,colour),colour==='w'?56:7);
    assert.equal(squareForCell(7,7,colour),colour==='w'?7:56);
  }
});
test('pointer hit testing uses board geometry, orientation, and rejects outside drops',()=>{
  for(const size of [240,320,640]){
    const rect={left:12,top:20,width:size,height:size};
    for(const colour of ['w','b'])for(let row=0;row<8;row++)for(let col=0;col<8;col++){
      const x=12+(col+.5)*size/8,y=20+(row+.5)*size/8;
      assert.equal(squareAtPoint(rect,x,y,colour),squareForCell(row,col,colour));
    }
    assert.equal(squareAtPoint(rect,11,20,'w'),-1);
    assert.equal(squareAtPoint(rect,12+size,20,'w'),-1);
    assert.equal(squareAtPoint(rect,12,20+size,'b'),-1);
  }
});
test('every original vector is inline, consistently sized and distinguishable',()=>{
  const vectors=['K','B','N','R'].flatMap(t=>['w','b'].map(c=>pieceSVG(c+t)));
  assert.equal(vectors.length,8);
  for(const svg of vectors){
    assert.match(svg,/viewBox="0 0 100 100"/);
    assert.match(svg,/aria-hidden="true"/);
    assert.doesNotMatch(svg,/(?:href|src)=["']https?:|<image|font-family/);
  }
  assert.match(pieceLabel('bN'),/black knight/);
});
test('board CSS isolates visual metrics from fixed grid geometry',()=>{
  const css=readFileSync('src/styles.css','utf8');
  assert.match(css,/grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css,/grid-template-rows:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css,/aspect-ratio:\s*1\s*\/\s*1/);
  assert.match(css,/\.piece-icon\s*\{[^}]*position:\s*absolute/s);
  assert.match(css,/\.sq\s*\{[^}]*min-width:\s*0;[^}]*min-height:\s*0/s);
  assert.match(css,/touch-action:\s*none/);
});
test('game UI keeps both modalities and material release gate visible',()=>{
  const app=readFileSync('src/app.js','utf8');
  assert.match(app,/pointerdown/);
  assert.match(app,/pointermove/);
  assert.match(app,/pointerup/);
  assert.match(app,/pointercancel/);
  assert.match(app,/interact\(square/);
  assert.match(app,/disabled aria-disabled="true"/);
  assert.doesNotMatch(app,/♔|♚|♗|♝|♘|♞|♖|♜/);
});

test('new Maths tab retains keyboard, undo and drag interactions independently of arena',()=>{
  const app=readFileSync('src/maths-app.js','utf8');
  const browser=readFileSync('scripts/browser-qa.mjs','utf8');
  for(const key of ['Escape','Delete','Backspace'])assert.ok(app.includes(key));
  for(const id of ['maths-undo','maths-clear','maths-start','maths-edit'])assert.ok(app.includes(id));
  for(const pointer of ['pointerdown','pointermove','pointerup','pointercancel'])assert.ok(app.includes(pointer));
  assert.match(app,/history\\.push\\(save\\(\\)\\)/);
  assert.match(app,/hasPointerCapture/);
  assert.match(browser,/tray drag placed white king/);
  assert.match(browser,/weak-side ownership/);
  assert.match(browser,/64 squares/);
  assert.doesNotMatch(app,/\\bfetch\\s*\\(|\\bWebSocket\\s*\\(/);
});

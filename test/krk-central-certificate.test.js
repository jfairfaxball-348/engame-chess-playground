import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeBoard,opposite,positionKey,squareAt} from '../src/chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from '../src/krk-local-witness.js';
import {krkCentralStaticBound} from '../src/krk-central-sequence.js';
import {gitBlobHash,verifyKRKCentralPolicySources}
  from '../scripts/verify-krk-proof-sources.mjs';

function root(strong,y,frame){
  const b=makeBoard();b[squareAt(3,y-1)]=strong+'K';
  b[squareAt(0,y)]=strong+'R';b[squareAt(3,y+1)]=opposite(strong)+'K';
  const board=makeBoard();
  for(let i=0;i<64;i++)if(b[i])board[krkTransformSquare(i,frame)]=b[i];
  return {board,turn:strong,material:'krk',halfmove:0,log:[],
    history:[positionKey(board,strong)]};
}
test('uncut static bounds retain 101-ply limitation in every colour/frame',()=>{
  const expected=[101,83,65,47,29,11];
  for(const strong of ['w','b'])for(const frame of KRK_FRAMES)
    for(let y=1;y<=6;y++){
      const state=root(strong,y,frame),before=structuredClone(state);
      const bound=krkCentralStaticBound(state,frame);
      assert.equal(bound.plies,expected[y-1]);
      assert.equal(bound.coversFIDEClaims,false);
      assert.equal(bound.isCompleteWinningPolicy,false);
      assert.equal(bound.maxMatePlies,null);
      assert.deepEqual(state,before);
    }
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
});
test('static policy bound rejects unsupported or invalid roots',()=>{
  const s=root('w',2,'id');
  assert.equal(krkCentralStaticBound({...s,turn:'b'}),null);
  assert.equal(krkCentralStaticBound({...s,material:'kk'}),null);
  assert.equal(krkCentralStaticBound({...s,history:[]}),null);
  assert.equal(krkCentralStaticBound(s,'unknown'),null);
});
test('central policy source lock verifies immutable bytes and rejects corruption',async()=>{
  const lock=JSON.parse(readFileSync('proof-sources/krk10-central-policy.lock.json','utf8'));
  const content=Buffer.from('central policy fixture');
  for(const source of lock.sources)source.gitBlob=gitBlobHash(content);
  assert.equal(await verifyKRKCentralPolicySources(lock,async()=>({
    ok:true,arrayBuffer:async()=>content
  })),15);
  await assert.rejects(verifyKRKCentralPolicySources(lock,async()=>({
    ok:true,arrayBuffer:async()=>Buffer.from('corrupted')
  })),/Routing source mismatch/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gitBlobHash,verifyKRKPreparedSources}
  from '../scripts/verify-krk-proof-sources.mjs';

test('KRK11 prepared policy source hash chain is immutable and fail closed',async()=>{
  const lock=JSON.parse(readFileSync('proof-sources/krk11-prepared-wall.lock.json','utf8'));
  assert.equal(lock.gameplayReleased,false);
  const content=Buffer.from('KRK11 fixture'),paths=[];
  for(const source of lock.sources)source.gitBlob=gitBlobHash(content);
  assert.equal(await verifyKRKPreparedSources(lock,async url=>{
    paths.push(url);
    return {ok:true,arrayBuffer:async()=>content};
  }),19);
  assert.ok(paths.every(p=>p.includes('/'+lock.sourceCommit+'/')));
  assert.ok(paths.some(p=>p.endsWith('/PreparedWallPolicy.lean')));
  await assert.rejects(verifyKRKPreparedSources(lock,async()=>({
    ok:true,arrayBuffer:async()=>Buffer.from('tampered')
  })),/Routing source mismatch/);
});

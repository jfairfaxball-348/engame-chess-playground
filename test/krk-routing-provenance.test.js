import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gitBlobHash,verifyKRKRoutingSources}
  from '../scripts/verify-krk-proof-sources.mjs';

const fixture=()=>{
  const lock=JSON.parse(readFileSync('proof-sources/krk09-routing.lock.json','utf8'));
  const content=Buffer.from('immutable draft routing fixture');
  for(const source of lock.sources)source.gitBlob=gitBlobHash(content);
  return {lock,content};
};
test('routing lock verifies every source at an immutable commit',async()=>{
  const {lock,content}=fixture(),requests=[];
  const count=await verifyKRKRoutingSources(lock,async url=>{
    requests.push(url);return {ok:true,arrayBuffer:async()=>content};
  });
  assert.equal(count,14);assert.equal(requests.length,14);
  assert.ok(requests.every(url=>url.includes('/'+lock.sourceCommit+'/')));
});
test('routing verification rejects corrupted source bytes',async()=>{
  const {lock}=fixture();
  await assert.rejects(verifyKRKRoutingSources(lock,async()=>({
    ok:true,arrayBuffer:async()=>Buffer.from('changed')
  })),/Routing source mismatch/);
});
test('routing draft lock cannot be presented as a gameplay release',async()=>{
  const {lock}=fixture();lock.gameplayReleased=true;
  let fetched=false;
  await assert.rejects(verifyKRKRoutingSources(lock,async()=>{
    fetched=true;throw Error('should not fetch');
  }),/Invalid unreleased/);
  assert.equal(fetched,false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gitBlobHash,readLock,validateLock,verifyKRKProofSources} from '../scripts/verify-krk-proof-sources.mjs';

test('pinned KRK proof lock has all required theorem records and named Lean constructions',()=>{
  const lock=readLock();
  assert.equal(validateLock(lock),true);
  assert.equal(lock.sourceRepository,'jfairfaxball-348/engame-chess');
  assert.equal(lock.sourceCommit,'e7de0930fc61caeb11795cf3c10fde11e4774a40');
  assert.equal(lock.sources.length,20);
  assert.ok(lock.sources.some(s=>s.path.endsWith('KRKCentral/PrepPair.lean')));
  assert.ok(lock.sources.some(s=>s.path.endsWith('KRKLastReply.lean')));
  assert.ok(lock.sources.some(s=>s.path.endsWith('KRKImmediate.lean')));
  assert.ok(lock.sources.some(s=>s.path.endsWith('KRKWinning/Policy.lean')));
  assert.ok(lock.sources.some(s=>s.path.endsWith('EC-T0048/v1.md')));
  const proof=readFileSync('src/maths-proof.js','utf8');
  assert.match(proof,/krkRoot='https:\/\/github\.com\/jfairfaxball-348\/engame-chess\/blob\/e7de0930fc61caeb11795cf3c10fde11e4774a40\//);
  assert.match(proof,/sourceUrl:\(kind==='krk'\?krkRoot:root\)/);
});

test('Git blob hash is content-addressed and detects changes',()=>{
  assert.equal(gitBlobHash(Buffer.from('hello\n')),'ce013625030ba8dba906f756967f9e9ca394464a');
  assert.notEqual(gitBlobHash(Buffer.from('hello!\n')),gitBlobHash(Buffer.from('hello\n')));
  assert.equal(gitBlobHash(Buffer.from('hello\n','utf8')),gitBlobHash('hello\n'));
});

test('source lock rejects duplicate, traversed and altered paths or missing theorem records',()=>{
  const base=readLock();
  assert.throws(()=>validateLock({...base,sourceCommit:'main'}),/Invalid KRK/);
  assert.throws(()=>validateLock({...base,sources:[...base.sources,base.sources[0]]}),/duplicate/);
  assert.throws(()=>validateLock({...base,sources:[
    {...base.sources[0],path:'formal/../secrets.lean'},...base.sources.slice(1)
  ]}),/Invalid or duplicate/);
  assert.throws(()=>validateLock({...base,sources:base.sources.filter(s=>!s.path.includes('EC-T0049/v1.md'))}),/Missing frozen theorem/);
  assert.throws(()=>validateLock({...base,sources:[{path:base.sources[0].path,gitBlob:'0000000000000000000000000000000000000000'},...base.sources.slice(1)],frozenProofSourceCommits:{...base.frozenProofSourceCommits,'EC-T0049':'main'}}),/Missing frozen theorem/);
});

test('locked proof source fetch fails closed on unavailable or mismatched upstream content',async()=>{
  const lock=readLock();
  let seen=[];
  await assert.rejects(verifyKRKProofSources(lock,async(url)=>{
    seen.push(url);return {ok:false,status:404};
  }),/Lean source unavailable/);
  assert.equal(seen.length,1);
  assert.ok(seen[0].includes('/'+lock.sourceCommit+'/'));
  seen=[];
  await assert.rejects(verifyKRKProofSources(lock,async(url)=>{
    seen.push(url);
    return {ok:true,arrayBuffer:async()=>Buffer.from('tampered frozen Lean source')};
  }),/Pinned Lean source mismatch/);
  assert.equal(seen.length,1);
});

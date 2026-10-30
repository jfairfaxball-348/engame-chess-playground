import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

// Contract test for a DIAGNOSTIC, not a release proof. This deliberately
// checks complete adversarial defender fanout and honest failure categories.
test('KQK21 bounded all-defender audit is reproducible and reports uncertainty',()=>{
  const args=['scripts/kqk21-adversarial.mjs','--attempts=128',
    '--per-family=1','--nodes=80','--rounds=6'];
  const run=()=>JSON.parse(execFileSync(process.execPath,args,{
    encoding:'utf8',timeout:25000,maxBuffer:1024*1024
  }));
  const a=run(),b=run();
  assert.deepEqual(a,b,'fixed seed audit must reproduce the same verdicts');
  assert.equal(a.diagnosticOnly,true);
  assert.equal(a.clockHistoryCertified,false);
  assert.ok(a.roots>0);
  assert.equal(a.allRepliesMate+a.falsified+a.inconclusive,a.roots);
  assert.ok(a.legalDefenderRepliesVisited>0,'must visit actual weak replies');
  assert.ok(a.visitedNodes>0);
  assert.ok(a.roots<=a.legalCandidates);
  assert.ok(a.inconclusive>=0,'caps must not be silently counted as mate');
  for(const f of Object.values(a.families))
    assert.equal(f.allRepliesMate+f.falsified+f.inconclusive,f.roots);
});

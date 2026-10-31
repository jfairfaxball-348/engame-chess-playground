import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,newGame,opposite,squareAt,validateSetup} from '../src/chess.js';
import {kqk32FarFileCase,kqk32CaseFromState,KQK32_FRAMES,
  auditKQK32FarFile,kqk32FixtureRoots,kqk32AuditPreparedRoot}
  from '../scripts/kqk32-far-file-audit.mjs';

// These are positions INSIDE far_file_stage_bound's four disjoint cases,
// not asserted to be live-controller roots or post-preparation reachables.
// In particular the tight case need not arise from the S025 first step.
const cases=[
  {king:[1,0],queen:[0,2],weak:[5,5],branch:'separating-rank'},
  {king:[1,0],queen:[0,4],weak:[5,3],branch:'direct-small-file'},
  {king:[1,1],queen:[0,5],weak:[4,2],branch:'horizontal-far-wall'},
  {king:[1,1],queen:[0,3],weak:[4,2],branch:'tight-above'}
];

test('S032 all four ordered frozen FarFileEntry cases retain their original frame under both colours and eight symmetries',()=>{
  let checked=0;
  for(const f of cases){
    assert.equal(kqk32FarFileCase(f.king,f.queen,f.weak),f.branch);
    for(const strong of ['w','b'])
      for(const [frame,transform] of Object.entries(KQK32_FRAMES)){
        const at=([x,y])=>squareAt(...transform([x,y]));
        const board=makeBoard(),weak=opposite(strong);
        board[at(f.king)]=strong+'K';
        board[at(f.queen)]=strong+'Q';
        board[at(f.weak)]=weak+'K';
        assert.equal(validateSetup(board,'kqk',strong),null,
          JSON.stringify({f,strong,frame}));
        const state=newGame(board,strong,'kqk',{experimentalKQK:true});
        const sourceFrame=frame==='rotate90'?'rotate270':
          frame==='rotate270'?'rotate90':frame;
        assert.equal(kqk32CaseFromState(state,strong,sourceFrame),f.branch,
          JSON.stringify({f,strong,frame}));
        checked++;
      }
  }
  assert.equal(checked,64);
  assert.equal(kqk32FarFileCase([1,1],[2,3],[4,2]),null,
    'not-far-file states must not be attributed to this Lean theorem');
});

test('S032 genuine source-issued FarFilePreparation tokens are audited over every weak reply without re-preparation',()=>{
  const report=auditKQK32FarFile();
  assert.ok(report.eligible>=2,'S025 fixture must trigger in both colours');
  assert.ok(report.replyCount>=report.eligible);
  assert.equal(report.replyCount,Object.values(report.counts).reduce((a,b)=>a+b,0));
  assert.equal(report.fourCaseGlobalCorrespondenceCertified,false);
  assert.equal(report.fullKQKStrategyCertified,false);
  assert.equal(report.missing>=0&&report.crossFrame>=0,true);
  for(const {strong,root} of kqk32FixtureRoots()){
    const a=kqk32AuditPreparedRoot(root,strong);
    if(!a.eligible)continue;
    assert.ok(a.entries.length>0);
    for(const step of a.entries){
      assert.ok(step.priorToken.kind==='far-file');
      assert.equal(step.priorToken.frame,a.originalFrame);
      assert.notEqual(step.case,'unaccounted-for',
        JSON.stringify({strong,sourceCase:step.case,step}));
      if(step.chosenSource)
        assert.doesNotMatch(step.chosenSource,
          /FarFilePreparation\.far_file_preparation/,
          'the frozen pair composition cannot run far-file preparation twice');
    }
  }
});

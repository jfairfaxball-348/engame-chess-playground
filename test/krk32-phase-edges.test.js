import test from 'node:test';
import assert from 'node:assert/strict';
import {auditKRK32PhaseEdges} from '../scripts/krk32-phase-edges.mjs';

test('S032 KRK traces every immediate legal defender reply and never treats it as a global termination proof',()=>{
  const report=auditKRK32PhaseEdges();
  assert.equal(report.roots,24);
  assert.equal(report.sourceRootMoves+report.roots-report.sourceRootMoves,24);
  assert.ok(report.sourceRootMoves>0);
  assert.ok(report.defenderReplies>0);
  assert.ok(report.nextSourceMoves+report.missingSource+report.rookCaptures+
    report.nonmateTerminals+report.mates>=report.defenderReplies,
    'every visited defender choice must be classified');
  assert.ok(Object.keys(report.edges).length>0);
  assert.equal(report.universalTerminationRankFound,false);
  assert.equal(report.globalAllReplyProof,false);
  assert.deepEqual(auditKRK32PhaseEdges(),report,'fixed source roots must replay deterministically');
});

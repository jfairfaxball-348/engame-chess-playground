import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeS047RootShards}
  from '../scripts/s047-merge-root-shards.mjs';

const TOTAL=64**3;
const SHA='c72365a8ba46f59114a2a77d9d38993f6a52df80';
const groups=['w-strong,w-turn','w-strong,b-turn',
  'b-strong,b-turn','b-strong,w-turn'];
const emptyPremises=()=>({
  authenticated:0,unchecked:0,'failed-premise':0,missing:0
});
// Mock reports test aggregation mechanics, NOT actual chess outcomes.
function fakeShard(index,shardCount,{inspectReplies=true}={}){
  const candidates=Math.floor((TOTAL-1-index)/shardCount)+1;
  const oneGroup=()=>({
    candidateAssignments:candidates,
    legalRoots:1,distinctObservedD4Orbits:1,
    terminal:{mate:0,stalemate:0,other:0},ongoing:1,
    sourceSelected:0,missingFirstSource:1,illegalSourceMove:0,
    localPremises:emptyPremises(),selectedRules:{},selectedFrames:{},
    farFileOriginalFrameCases:{},
    directWeakQueenCaptures:0,weakReplies:0,weakNonCaptureReplies:0,
    followingSourceSelected:0,followingSourceMissing:0,
    followingIllegalSourceMove:0,
    followingPremises:emptyPremises(),
    afterFirstStrongWeakReplies:0,afterFirstStrongCaptures:0,
    afterFirstStrongSourceSelected:0,afterFirstStrongSourceMissing:0,
    terminalAfterStrong:{mate:0,stalemate:0,other:0},
    terminalAfterReply:{mate:0,stalemate:0,other:0},
    exhaustedShard:true,sampledLegalRootsOnly:false
  });
  return {sourceSha:SHA,
    scope:{full:true,shardIndex:index,shardCount,inspectReplies,
      squareAssignmentsPerMaterialSide:TOTAL},
    groups:Object.fromEntries(groups.map(k=>[k,oneGroup()])),
    firstIssues:{'missing-source':{at:'fixture',strong:'w'}},
    allRootBoardsEnumerated:shardCount===1,
    sourceIssuedTokensOnly:true,allDefenderTerminationCertified:false,
    universalKQKMatingCertified:false,fideHistoryCertified:false};
}
test('S047 accepts exactly every disjoint full shard and sums four colour/turn groups',()=>{
  const result=mergeS047RootShards([3,1,0,2].map(i=>fakeShard(i,4)));
  assert.equal(result.allRootBoardsEnumerated,true);
  assert.equal(result.allImmediateWeakRepliesEnumerated,true);
  assert.equal(result.allDefenderTerminationCertified,false);
  assert.equal(result.universalKQKMatingCertified,false);
  assert.equal(result.scope.shardsMerged,4);
  assert.equal(result.perShard.length,4);
  assert.deepEqual(result.perShard.map(s=>s.index),[0,1,2,3]);
  for(const group of groups){
    assert.equal(result.groups[group].candidateAssignments,TOTAL);
    assert.equal(result.groups[group].legalRoots,4);
    // Same D4 orbit might appear in multiple shards. This is NOT unique.
    assert.equal(result.groups[group].sumPerShardD4OrbitCounts,4);
    assert.equal(result.groups[group].distinctObservedD4Orbits,undefined);
  }
  assert.equal(result.scope.perShardD4OrbitCountSumIsNotGlobalUniqueCount,
    true);
});
test('S047 missing, duplicate or unfinished shard never earns full coverage',()=>{
  assert.throws(()=>mergeS047RootShards([fakeShard(0,2)]),
    /expected 2 reports/);
  assert.throws(()=>mergeS047RootShards([fakeShard(0,2),fakeShard(0,2)]),
    /duplicate shard/);
  const a=fakeShard(0,2),b=fakeShard(1,2);
  b.groups[groups[0]].exhaustedShard=false;
  assert.throws(()=>mergeS047RootShards([a,b]),/unfinished/);
});
test('S047 rejects wrong raw counts, invalid outcome partitions and false cert flags',()=>{
  {
    const a=fakeShard(0,1);
    a.groups[groups[0]].candidateAssignments--;
    assert.throws(()=>mergeS047RootShards([a]),/wrong square count/);
  }
  {
    const a=fakeShard(0,1);
    a.groups[groups[0]].ongoing=0;
    assert.throws(()=>mergeS047RootShards([a]),/partition mismatch/);
  }
  {
    const a=fakeShard(0,1);
    a.universalKQKMatingCertified=true;
    assert.throws(()=>mergeS047RootShards([a]),/certification gate drift/);
  }
  {
    const a=fakeShard(0,1);
    a.groups[groups[0]].sourceSelected=1;
    assert.throws(()=>mergeS047RootShards([a]),/premise count mismatch/);
  }
});
test('S047 never equates complete roots with checked immediate replies',()=>{
  const a=fakeShard(0,2,{inspectReplies:false});
  const b=fakeShard(1,2,{inspectReplies:false});
  const result=mergeS047RootShards([a,b]);
  assert.equal(result.allRootBoardsEnumerated,true);
  assert.equal(result.allImmediateWeakRepliesEnumerated,false);
  assert.equal(result.allDefenderTerminationCertified,false);
  b.scope.inspectReplies=true;
  assert.throws(()=>mergeS047RootShards([a,b]),/reply scopes differ/);
});

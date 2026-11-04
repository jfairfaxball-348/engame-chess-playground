/**
 * S047: assemble independently completed S046 exhaustive KQK root shards.
 * This is an accounting validator, NOT an all-defender mate certificate.
 * Each of the M shards must have inspected exactly its residue class of
 * the 64^3 raw K/Q/k square assignments for EACH strong-colour/turn group.
 */
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

const TOTAL=64**3;
const GROUPS=['w-strong,w-turn','w-strong,b-turn',
  'b-strong,b-turn','b-strong,w-turn'];
const SOURCE_SHA='c72365a8ba46f59114a2a77d9d38993f6a52df80';
const assert=(condition,message)=>{
  if(!condition)throw Error('S047 incomplete/invalid shard: '+message);
};
const integer=(n)=>Number.isSafeInteger(n)&&n>=0;
const sameKeys=(object,keys)=>JSON.stringify(Object.keys(object).sort())===
  JSON.stringify([...keys].sort());

function validateCountTree(obj,path){
  assert(obj!==null&&typeof obj==='object'&&!Array.isArray(obj),
    path+' is not a count object');
  for(const [key,value] of Object.entries(obj)){
    if(typeof value==='number')assert(integer(value),path+'.'+key);
    else validateCountTree(value,path+'.'+key);
  }
}
function accumulate(to,from){
  for(const [key,value] of Object.entries(from)){
    if(key==='distinctObservedD4Orbits'||key==='exhaustedShard'||
       key==='sampledLegalRootsOnly')continue;
    if(typeof value==='number')to[key]=(to[key]??0)+value;
    else{
      to[key]??={};
      accumulate(to[key],value);
    }
  }
}

/**
 * Only a FULL contiguous set of mutually exclusive shards may produce
 * allRootBoardsEnumerated=true. D4 orbit counts CANNOT be added across
 * shards to recover the number of unique global orbits; retain the sum
 * under an explicitly non-unique name instead.
 */
export function mergeS047RootShards(reports){
  assert(Array.isArray(reports)&&reports.length>0,'no reports');
  const first=reports[0];
  const M=first?.scope?.shardCount;
  assert(integer(M)&&M>=1&&M<=256,'invalid shard count');
  assert(reports.length===M,'expected '+M+' reports, got '+reports.length);
  const inspectReplies=first.scope.inspectReplies;
  assert(typeof inspectReplies==='boolean','missing reply scope');
  const byShard=new Map();
  for(const report of reports){
    const s=report?.scope;
    assert(report?.sourceSha===SOURCE_SHA,'source lock mismatch');
    assert(s?.full===true&&s.shardCount===M&&
      s.squareAssignmentsPerMaterialSide===TOTAL,
      'scope does not cover exhaustive identical root universes');
    assert(s.inspectReplies===inspectReplies,'reply scopes differ');
    assert(integer(s.shardIndex)&&s.shardIndex<M,
      'invalid shard index');
    assert(!byShard.has(s.shardIndex),'duplicate shard '+s.shardIndex);
    assert(report.sourceIssuedTokensOnly===true&&
      report.allDefenderTerminationCertified===false&&
      report.universalKQKMatingCertified===false&&
      report.fideHistoryCertified===false,
      'source or certification gate drift');
    assert(report.allRootBoardsEnumerated===(M===1),
      'shard falsely marked globally complete');
    assert(report.groups&&sameKeys(report.groups,GROUPS),
      'missing or extraneous colour/turn group');
    const expectedCandidates=Math.floor((TOTAL-1-s.shardIndex)/M)+1;
    for(const groupName of GROUPS){
      const g=report.groups[groupName];
      assert(g?.exhaustedShard===true&&
        g.sampledLegalRootsOnly===false,
        'shard '+s.shardIndex+' unfinished: '+groupName);
      validateCountTree(Object.fromEntries(Object.entries(g).filter(
        ([key])=>key!=='exhaustedShard'&&key!=='sampledLegalRootsOnly')),
        'shard '+s.shardIndex+' '+groupName);
      assert(g.candidateAssignments===expectedCandidates,
        'wrong square count in shard '+s.shardIndex+' '+groupName);
      assert(g.legalRoots<=g.candidateAssignments,
        'legal roots exceed candidates');
      assert(g.terminal.mate+g.terminal.stalemate+
        g.terminal.other+g.ongoing===g.legalRoots,
        'root outcome partition mismatch');
      assert(g.sourceSelected===g.localPremises.authenticated+
        g.localPremises.unchecked+
        g.localPremises['failed-premise']+
        g.localPremises.missing,'first premise count mismatch');
      assert(g.followingSourceSelected+
        g.afterFirstStrongSourceSelected===
        g.followingPremises.authenticated+
        g.followingPremises.unchecked+
        g.followingPremises['failed-premise']+
        g.followingPremises.missing,
        'continuation premise count mismatch');
    }
    byShard.set(s.shardIndex,report);
  }
  for(let i=0;i<M;i++)assert(byShard.has(i),'missing shard '+i);
  const groups={};
  const perShard=[];
  const firstIssues={};
  for(let i=0;i<M;i++){
    const report=byShard.get(i);
    const groupCounts={};
    for(const name of GROUPS){
      const g=report.groups[name];
      groups[name]??={candidateAssignments:0,
        sumPerShardD4OrbitCounts:0};
      accumulate(groups[name],g);
      groups[name].sumPerShardD4OrbitCounts+=
        g.distinctObservedD4Orbits;
      groupCounts[name]={candidateAssignments:g.candidateAssignments,
        legalRoots:g.legalRoots,immediateCaptures:
          g.directWeakQueenCaptures+g.afterFirstStrongCaptures};
    }
    for(const [name,value] of Object.entries(report.firstIssues??{}))
      firstIssues[name]??={shardIndex:i,...value};
    perShard.push({index:i,groups:groupCounts});
  }
  for(const name of GROUPS)
    assert(groups[name].candidateAssignments===TOTAL,
      'merged incomplete root square universe: '+name);
  return {sourceSha:SOURCE_SHA,
    scope:{full:true,shardsMerged:M,squareAssignmentsPerMaterialSide:TOTAL,
      inspectReplies,allFourColourTurnGroups:true,
      globalDistinctD4OrbitCount:'not computed: cross-shard overlap',
      perShardD4OrbitCountSumIsNotGlobalUniqueCount:true},
    groups,perShard,firstIssues,
    allRootBoardsEnumerated:true,
    allImmediateWeakRepliesEnumerated:inspectReplies,
    sourceIssuedTokensOnly:true,
    allDefenderTerminationCertified:false,
    universalKQKMatingCertified:false,
    fideHistoryCertified:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const files=process.argv.slice(2);
  assert(files.length>0,'give all shard JSON file paths');
  const reports=files.map(file=>JSON.parse(readFileSync(file,'utf8')));
  console.log(JSON.stringify(mergeS047RootShards(reports),null,2));
}

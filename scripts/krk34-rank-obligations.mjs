/**
 * S034 — KRK named source-lemma obligations from two whole weak-reply
 * layers. A phase registry is NOT a lexicographic termination theorem.
 * Preserve exact second-source tags so a future proof can be matched to
 * a concrete JS transition, not an invented "phase decreases" slogan.
 */
import {pathToFileURL} from 'node:url';
import {auditKRK33SecondPhaseEdges} from './krk33-second-phase-edges.mjs';

export function auditKRK34RankObligations(){
  const twoPly=auditKRK33SecondPhaseEdges();
  const bySecondSource={};
  let transitions=0,branchingSourceRules=0;
  for(const [edge,count] of Object.entries(twoPly.edges)){
    const boundary=edge.lastIndexOf(' -> ');
    if(boundary<0)throw new Error('unrecognised source edge: '+edge);
    const before=edge.slice(0,boundary),after=edge.slice(boundary+4);
    const row=bySecondSource[before]??={total:0,successors:{}};
    row.total+=count;
    row.successors[after]=(row.successors[after]??0)+count;
    transitions+=count;
  }
  for(const row of Object.values(bySecondSource))
    if(Object.keys(row.successors).length>1)branchingSourceRules++;
  const obligations=Object.entries(bySecondSource)
    .map(([source,row])=>({
      source,observedReplies:row.total,
      successorRules:Object.entries(row.successors).sort((a,b)=>b[1]-a[1]),
      needsSourceRankProof:true
    })).sort((a,b)=>b.observedReplies-a.observedReplies);
  const unresolved=twoPly.missingWitnesses;
  return {
    roots:twoPly.roots,firstReplies:twoPly.firstReplies,
    secondReplies:twoPly.secondReplies,sourceMoves:twoPly.thirdSourceMoves,
    missingSource:twoPly.missing,rookCaptures:twoPly.rookCaptures,
    nonmateTerminals:twoPly.nonmateTerminals,
    transitions,distinctSecondSourceLabels:obligations.length,
    branchingSourceRules,sourceObligations:obligations,
    unresolvedWitnesses:unresolved,
    sourceRankTheoremFrozen:false,
    allDefenderTerminationCertified:false,
    firstMissingProofBridge:
      'An exact source-backed well-founded measure for every JS tagged (board, continuation token) state, with strict descent or a proven terminal bound after every strong action AND every legal weak reply, across prepared/central/restoration and setup/nonwall/prep transfers. KRKWinning.Policy.winning_policy uses Classical.choose; KRKForcing.StrategyTransport transports existence, not this JS selector.',
    note:'Only two weak-reply layers at 24 source seeds. Multiple next source rules under the same coarse phase label require branch-sensitive composition, but neither branching nor a bounded non-cycle proves termination.'
  };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(auditKRK34RankObligations(),null,2));

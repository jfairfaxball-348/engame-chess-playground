/**
 * S032 — exact one-reply KRK source-phase edge audit.
 *
 * KRK30's 96 sampled mates and KRK31's capped all-defender trees cannot
 * establish a descending global rank. Record every immediate legal weak
 * reply and the subsequent frozen-source continuation, including the
 * complete incoming proof token and a replayable board key. This script
 * does NOT choose a defender move for the Maths tab, certify termination,
 * or promote a partial policy to a winning theorem.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,opposite,outcome,play,positionKey} from '../src/chess.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {krk15StratifiedRoots} from './krk15-stratified-mate-audit.mjs';
import {krk14ControlStateKey} from './krk14-mate-tree.mjs';

export function auditKRK32PhaseEdges(){
  let roots=0,sourceRootMoves=0,defenderReplies=0,
    nextSourceMoves=0,missingSource=0,rookCaptures=0,mates=0,
    nonmateTerminals=0;
  const edges={},witnesses=[];
  for(const {phase,strong,frame,state} of krk15StratifiedRoots()){
    roots++;
    const chosen=krkTaggedStrongChoice(state);
    if(!chosen?.move){
      missingSource++;
      witnesses.push({phase,strong,frame,kind:'missing-root-source',
        at:positionKey(state.board,state.turn)});
      continue;
    }
    sourceRootMoves++;
    const after=play(state,chosen.move);
    const a=outcome(after.board,after.turn,after.history,after.halfmove);
    if(a.kind==='mate'){mates++;continue;}
    if(a.kind!=='ongoing'){
      nonmateTerminals++;
      witnesses.push({phase,strong,frame,kind:'nonmate-after-source',
        terminal:a.kind});
      continue;
    }
    for(const reply of legalMoves(after.board,opposite(strong))){
      defenderReplies++;
      const prefix=phase+' / '+(chosen.sourcePhase??chosen.rule??'unknown');
      if(reply.capture===strong+'R'){
        rookCaptures++;
        edges[prefix+' -> rook-captured']=(edges[prefix+' -> rook-captured']||0)+1;
        continue;
      }
      const child=play(after,reply);
      const o=outcome(child.board,child.turn,child.history,child.halfmove);
      if(o.kind!=='ongoing'){
        if(o.kind==='mate')mates++;
        else nonmateTerminals++;
        edges[prefix+' -> '+o.kind]=(edges[prefix+' -> '+o.kind]||0)+1;
        continue;
      }
      const following=krkTaggedStrongChoice(child,chosen.continuationPhase);
      if(following?.move)nextSourceMoves++;
      else missingSource++;
      const key=prefix+' -> '+(following?.sourcePhase??'MISSING_SOURCE');
      edges[key]=(edges[key]||0)+1;
      if(!following?.move)
        witnesses.push({phase,strong,frame,kind:'missing-next-source',
          priorSource:chosen.sourcePhase??null,
          priorToken:chosen.continuationPhase,
          weakMove:[reply.from,reply.to],
          at:positionKey(child.board,child.turn),
          controlState:krk14ControlStateKey(chosen.continuationPhase)});
    }
  }
  return {roots,sourceRootMoves,defenderReplies,nextSourceMoves,
    missingSource,rookCaptures,mates,nonmateTerminals,edges,
    witnesses:witnesses.slice(0,24),
    universalTerminationRankFound:false,
    globalAllReplyProof:false,
    note:'Phase edges alone are not a well-founded rank: a KRK frozen-source proof step must bound every subsequent defended phase.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(auditKRK32PhaseEdges(),null,2));

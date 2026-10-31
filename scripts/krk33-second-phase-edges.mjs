/**
 * S033: source-step KRK second-layer all-reply phase obligations.
 * Every strong action is the live frozen-source tagged controller choice;
 * the audit never supplies a move. Branches are exhausted for TWO
 * defender replies; no finite prefix constitutes a termination rank.
 */
import {pathToFileURL} from 'node:url';
import {legalMoves,opposite,outcome,play,positionKey} from '../src/chess.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {krk15StratifiedRoots} from './krk15-stratified-mate-audit.mjs';
import {krk14ControlStateKey} from './krk14-mate-tree.mjs';

export function auditKRK33SecondPhaseEdges(){
  const edges={},missingWitnesses=[],recurrences=[];
  let roots=0,firstReplies=0,secondReplies=0,thirdSourceMoves=0,
    missing=0,mates=0,nonmateTerminals=0,rookCaptures=0;
  for(const {phase,strong,frame,state:root} of krk15StratifiedRoots()){
    roots++;
    const first=krkTaggedStrongChoice(root);
    if(!first?.move){
      missing++;missingWitnesses.push({phase,strong,frame,at:positionKey(root.board,root.turn),
        kind:'missing root source'});continue;
    }
    const afterFirst=play(root,first.move);
    for(const reply1 of legalMoves(afterFirst.board,opposite(strong))){
      firstReplies++;
      if(reply1.capture===strong+'R'){rookCaptures++;continue;}
      const state1=play(afterFirst,reply1);
      const second=krkTaggedStrongChoice(state1,first.continuationPhase);
      if(!second?.move){
        missing++;missingWitnesses.push({phase,strong,frame,
          at:positionKey(state1.board,state1.turn),kind:'missing second source',
          incoming:krk14ControlStateKey(first.continuationPhase),
          weak1:[reply1.from,reply1.to]});continue;
      }
      const afterSecond=play(state1,second.move);
      const status=outcome(afterSecond.board,afterSecond.turn,
        afterSecond.history,afterSecond.halfmove);
      if(status.kind!=='ongoing'){
        if(status.kind==='mate'&&status.winner===strong)mates++;
        else nonmateTerminals++;
        continue;
      }
      for(const reply2 of legalMoves(afterSecond.board,opposite(strong))){
        secondReplies++;
        const label=phase+' / '+(second.sourcePhase??second.rule??'unknown');
        if(reply2.capture===strong+'R'){
          rookCaptures++;edges[label+' -> rook captured']=(edges[label+' -> rook captured']??0)+1;
          continue;
        }
        const state2=play(afterSecond,reply2);
        const status2=outcome(state2.board,state2.turn,state2.history,state2.halfmove);
        if(status2.kind!=='ongoing'){
          if(status2.kind==='mate'&&status2.winner===strong)mates++;
          else nonmateTerminals++;
          edges[label+' -> '+status2.kind]=(edges[label+' -> '+status2.kind]??0)+1;
          continue;
        }
        const third=krkTaggedStrongChoice(state2,second.continuationPhase);
        const next=third?.sourcePhase??'MISSING_SOURCE';
        edges[label+' -> '+next]=(edges[label+' -> '+next]??0)+1;
        if(third?.move)thirdSourceMoves++;
        else{
          missing++;missingWitnesses.push({phase,strong,frame,
            at:positionKey(state2.board,state2.turn),kind:'missing third source',
            weak1:[reply1.from,reply1.to],weak2:[reply2.from,reply2.to],
            incoming:krk14ControlStateKey(second.continuationPhase)});
        }
        if(third?.move&&positionKey(state2.board,state2.turn)===
            positionKey(root.board,root.turn)&&
            krk14ControlStateKey(second.continuationPhase)==='null')
          recurrences.push({phase,strong,frame,at:positionKey(state2.board,state2.turn)});
      }
    }
  }
  return {roots,firstReplies,secondReplies,thirdSourceMoves,missing,
    mates,nonmateTerminals,rookCaptures,edges,
    missingWitnesses:missingWitnesses.slice(0,12),
    recurrences:recurrences.slice(0,12),
    sourceGlobalDescendingRank:false,allDefenderTerminationCertified:false,
    exactRemainingSourceObligation:'KRKWinning.Policy.winning_policy only provides a Classical.choose F-preserving Policy, and KRKForcing.StrategyTransport transports ForceMate existence; neither freezes a JS-tagged phase-token monotonicity lemma for every weak reply across setup/direct/central/restoration/mate.',
    note:'Two all-reply layers are a falsification prefix, not a terminal rank or mate certificate.'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
  console.log(JSON.stringify(auditKRK33SecondPhaseEdges(),null,2));

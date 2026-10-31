/**
 * S030: deterministic deep-spine KRK controller falsification.
 *
 * This is NOT the game policy and is NOT a game-tree proof. Each attacking
 * move comes only from the frozen-source tagged controller; defender policy
 * names select reproducible legal replies for diagnostics, not "best" play.
 * Unlike breadth-first 2,500-node audits, these bounded lines reach deep
 * phase transitions and distinguish geometric revisits from FIDE histories.
 */
import {pathToFileURL} from 'node:url';
import {
  legalMoves,opposite,outcome,play,positionKey,squareName
} from '../src/chess.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {krk14ControlStateKey} from './krk14-mate-tree.mjs';
import {krk15StratifiedRoots} from './krk15-stratified-mate-audit.mjs';

export const KRK30_REPLY_POLICIES=Object.freeze([
  'first','middle','last','alternating'
]);
const uci=m=>squareName(m.from)+squareName(m.to);

function selectReply(replies,policy,pair){
  const sorted=[...replies].sort((a,b)=>uci(a).localeCompare(uci(b)));
  if(policy==='first')return sorted[0];
  if(policy==='last')return sorted.at(-1);
  if(policy==='middle')return sorted[Math.floor(sorted.length/2)];
  return pair%2===0?sorted[0]:sorted.at(-1);
}

function terminal(status,sourceTurns,plies,trace,extra={}){
  return {status,sourceTurns,plies,trace,completeGlobalMateProof:false,
    fideClockHistoryCertified:false,...extra};
}

/** One reproducible legal defender sequence, never an adversarial proof.
 * Repeated board+whole source token is a possible controller loop, not an
 * identical FIDE state: history/clock differences are explicitly reported.
 */
export function traceKRK30Spine(root,{
  replyPolicy='alternating',maxPairs=80
}={}){
  if(!KRK30_REPLY_POLICIES.includes(replyPolicy)||
      !Number.isSafeInteger(maxPairs)||maxPairs<1)
    throw new RangeError('valid reply policy and positive pair cap required');
  const strong=root?.turn;
  if(!['w','b'].includes(strong)||root?.material!=='krk'||
     !root.board?.includes(strong+'R'))
    return terminal('invalid-root',0,0,[]);
  let state=root,token=null;
  const trace=[],seen=new Map();
  for(let pair=0;pair<maxPairs;pair++){
    const o=outcome(state.board,state.turn,state.history,state.halfmove);
    if(o.kind!=='ongoing')
      return terminal('terminal-before-source:'+o.kind,pair,state.log.length,
        trace,{winner:o.winner??null});
    const structural=positionKey(state.board,state.turn)+'|'+
      krk14ControlStateKey(token);
    const hist=state.history.join(';')+'|'+state.halfmove;
    const earlier=seen.get(structural);
    if(earlier){
      return terminal('repeated-controller-state',pair,state.log.length,
        trace,{repeat:{
          previousSourceTurn:earlier.pair,currentSourceTurn:pair,
          identicalHistory:earlier.history===hist,
          priorHalfmove:earlier.halfmove,currentHalfmove:state.halfmove,
          structuralKey:structural
        }});
    }
    seen.set(structural,{pair,history:hist,halfmove:state.halfmove});
    const choice=krkTaggedStrongChoice(state,token);
    if(!choice?.move)
      return terminal('missing-source-phase',pair,state.log.length,trace,
        {atKey:positionKey(state.board,state.turn),controller:token});
    const atKey=positionKey(state.board,state.turn);
    const after=play(state,choice.move);
    const step={pair,atKey,sourceMove:uci(choice.move),
      sourcePhase:choice.sourcePhase??null,phase:choice.phase??null,
      rootPhase:choice.rootPhase??null,rule:choice.rule??null,
      frame:choice.frame??null,controllerMode:token?.mode??null};
    trace.push(step);
    const next=outcome(after.board,after.turn,after.history,after.halfmove);
    if(next.kind==='mate')
      return terminal(next.winner===strong?'mate':'wrong-winner',pair+1,
        after.log.length,trace,{winner:next.winner});
    if(next.kind!=='ongoing')
      return terminal('terminal-after-source:'+next.kind,pair+1,
        after.log.length,trace);
    const replies=legalMoves(after.board,opposite(strong));
    if(!replies.length)
      return terminal('no-legal-weak-reply',pair+1,after.log.length,trace);
    const reply=selectReply(replies,replyPolicy,pair);
    step.weakReply=uci(reply);
    if(reply.capture===strong+'R')
      return terminal('defender-rook-capture',pair+1,after.log.length+1,
        trace);
    state=play(after,reply);
    token=choice.continuationPhase;
  }
  return terminal('pair-cap',maxPairs,state.log.length,trace);
}

/** Distinct views: breadth can exhaust its node budget before reaching
 * long continuations; a spine can reveal a real phase gap but cannot certify
 * all replies. In all cases source strategy and Maths gates are untouched.
 */
export function auditKRK30Spines({maxPairs=80}={}){
  const reports=[];
  const tally={};
  for(const {phase,strong,frame,state} of krk15StratifiedRoots())
    for(const replyPolicy of KRK30_REPLY_POLICIES){
      const result=traceKRK30Spine(state,{replyPolicy,maxPairs});
      tally[result.status]=(tally[result.status]||0)+1;
      reports.push({phase,strong,frame,replyPolicy,
        status:result.status,sourceTurns:result.sourceTurns,
        plies:result.plies,firstIssue:result.status==='mate'?null:{
          repeat:result.repeat??null,atKey:result.atKey??null,
          tail:result.trace.slice(-6)}
      });
    }
  return {scope:'24 fixed source roots x 4 reproducible legal-reply spines',
    paths:reports.length,maxPairs,tally,
    reports,allDefenderCertified:false,
    completeGlobalMateProof:false,fideClockHistoryCertified:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const a=process.argv.find(a=>a.startsWith('--pairs='));
  const maxPairs=a?Number(a.slice(8)):80;
  const r=auditKRK30Spines({maxPairs});
  console.log(JSON.stringify({scope:r.scope,paths:r.paths,
    maxPairs:r.maxPairs,tally:r.tally,
    nonMates:r.reports.filter(x=>x.status!=='mate').slice(0,16),
    completeGlobalMateProof:false,fideClockHistoryCertified:false},null,2));
}

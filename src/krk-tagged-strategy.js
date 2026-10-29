/**
 * KRK14 — tagged composition of the FROZEN constructive KRK source moves.
 *
 * Deliberately NOT a complete mating strategy or a released Maths opponent.
 * This dispatcher never consults an engine, tablebase, search, position atlas,
 * minimax, or arbitrary legal-move fallback. Every selected move belongs to an
 * existing upstream Lean construction and retains its original continuation
 * token; all branches fail closed if the observed board/history differ.
 */
import {
  applyMove,legalMoves,opposite,outcome,play,positionKey,validateSetup
} from './chess.js';
import {KRK_GAMEPLAY_RELEASED} from './krk-local-witness.js';
import {
  krkPartialRootChoice,krkNonWallEntryContinue,krkSetupEntryContinue
} from './krk-nonwall-entry.js';
import {krkPreparedWallChoice} from './krk-prepared-wall.js';

export const KRK_TAGGED_POLICY_SCOPE =
  'constructive source actions with tagged first-reply and later continuation; total mate proof pending';

function validState(s) {
  return s?.material==='krk'&&Array.isArray(s.board)&&s.board.length===64&&
    ['w','b'].includes(s.turn)&&Array.isArray(s.history)&&
    Array.isArray(s.log)&&Number.isInteger(s.halfmove)&&s.halfmove>=0&&
    s.history.at(-1)===positionKey(s.board,s.turn)&&
    validateSetup(s.board,'krk',s.turn)===null;
}

function phaseFor(choice) {
  if(choice?.sourcePhase==='two-step-setup')return 'setup';
  if(choice?.sourcePhase==='nonwall-entry')return 'direct';
  if(choice?.kind==='step'&&['prep','central'].includes(choice.sourcePhase))
    return 'prepared';
  return null;
}

/**
 * On the first strong turn context is null. On later strong turns it is
 * EXACTLY the token emitted with the preceding strong move, presented after
 * the real intervening weak move. There is no policy re-selection on later
 * turns: the original Lean proof frame and subphase must continue.
 */
export function krkTaggedStrongChoice(state,context=null) {
  if(KRK_GAMEPLAY_RELEASED||!validState(state)||
      !state.board.includes(state.turn+'R')||
      outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  let next;
  if(context===null){
    next=krkPartialRootChoice(state);
  }else{
    if(context.kind!=='krk14-strong-continuation'||
      !['setup','direct','prepared'].includes(context.mode)||
      context.strong!==state.turn||
      context.historyLength!==state.history.length||
      context.halfmove!==state.halfmove||
      context.afterStrongKey!==state.history.at(-2)||
      !context.inner)return null;
    if(context.mode==='setup')
      next=krkSetupEntryContinue(state,context.inner);
    else if(context.mode==='direct')
      next=krkNonWallEntryContinue(state,context.inner);
    else next=krkPreparedWallChoice(state,context.frame,context.inner);
  }
  if(next?.kind!=='step'||!next.move||!next.continuationPhase)
    return null;
  const mode=phaseFor(next);
  if(!mode)return null;
  const legal=legalMoves(state.board,state.turn).some(
    m=>m.from===next.move.from&&m.to===next.move.to);
  if(!legal)return null;
  const after=applyMove(state.board,next.move);
  return Object.freeze({...next,continuationPhase:Object.freeze({
    kind:'krk14-strong-continuation',mode,frame:next.frame,
    strong:state.turn,inner:next.continuationPhase,
    afterStrongKey:positionKey(after,opposite(state.turn)),
    historyLength:state.history.length+2,halfmove:state.halfmove+2
  }),isCompleteWinningPolicy:false,maxMatePlies:null});
}

/**
 * Weak-to-move KRK is NOT a call to the strong-side move chooser.
 * Distinguish terminal weak roots, an actual available rook capture (KK
 * draw), and safe weak replies which lead into an existing strong-root
 * source action. This is a legal-reply classification, not game solving.
 */
export function classifyKRKWeakRoot(state,maxExamples=5) {
  if(!validState(state))return {kind:'invalid',fideCertified:false};
  const strong=['w','b'].find(c=>state.board.includes(c+'R'));
  if(!strong||state.turn!==opposite(strong))
    return {kind:'not-weak-to-move',fideCertified:false};
  const o=outcome(state.board,state.turn,state.history,state.halfmove);
  if(o.kind!=='ongoing')
    return {kind:o.kind,winner:o.winner??null,
      fideCertified:false,isCompleteWinningPolicy:false};
  let rookCaptures=0,safeReplies=0,selected=0,unsupported=0;
  const examples=[];
  for(const move of legalMoves(state.board,state.turn)) {
    if(move.capture===strong+'R'){rookCaptures++;continue;}
    const child=play(state,move);
    safeReplies++;
    if(krkTaggedStrongChoice(child)){selected++;continue;}
    unsupported++;
    if(examples.length<maxExamples)examples.push({
      from:move.from,to:move.to,
      afterKey:positionKey(child.board,child.turn)
    });
  }
  return {kind:'ongoing',strong,rookCaptures,safeReplies,
    sourceSelectedReplies:selected,unsupportedSafeReplies:unsupported,
    allSafeRepliesEnterSource:unsupported===0,
    hasImmediateKKDraw:rookCaptures>0,
    examples,fideCertified:false,isCompleteWinningPolicy:false};
}

/** Diagnostic trace along a GIVEN list of actual legal weak replies.
 * Never selects a defensive move; do not infer universal mate from one trace.
 */
export function krkTaggedTrace(root,weakReplyIndices=[],maxPairs=80) {
  if(!validState(root)||!root.board.includes(root.turn+'R'))
    return {ok:false,reason:'outside strong-turn root'};
  let state=root,context=null;
  for(let pair=0;pair<maxPairs;pair++){
    const step=krkTaggedStrongChoice(state,context);
    if(!step)return {ok:false,reason:'missing tagged strong continuation',pair};
    const after=play(state,step.move);
    const o=outcome(after.board,after.turn,after.history,after.halfmove);
    if(o.kind==='mate')return {ok:true,terminal:'mate',
      winner:o.winner,plies:pair*2+1,fideCertified:false};
    if(o.kind!=='ongoing')return {ok:false,reason:o.kind,pair};
    const replies=legalMoves(after.board,after.turn);
    const index=weakReplyIndices[pair]??0;
    if(!Number.isInteger(index)||index<0||index>=replies.length)
      return {ok:false,reason:'unprovided or invalid weak reply index',pair};
    if(replies[index].capture)
      return {ok:false,reason:'rook captured; KK draw',pair};
    state=play(after,replies[index]);
    context=step.continuationPhase;
  }
  return {ok:false,reason:'trace pair cap reached',pairs:maxPairs};
}

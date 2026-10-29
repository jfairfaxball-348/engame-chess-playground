/**
 * KRK12: three source-proved NON-WALL first moves into an oriented strict wall.
 *
 * This is a deliberately partial root dispatcher, not a complete game policy.
 * Each action is the coordinate from a frozen KRKForcing proof, independently
 * translated by krkConstructiveStep. No move selection uses a search/engine,
 * tablebase, heuristic score, or the defender enumeration below.
 *
 * Frozen source and immutable blob identities: proof-sources/krk.lock.json.
 *   entry    -> krk_clear_vertical_entry_force (ClearEntry.lean)
 *   retreat  -> krk_same_rank_retreat_force (SameRankSetup.lean)
 *   backrank -> krk_backrank_protected_force (SameRankSetup.lean)
 */
import {
  applyMove,legalMoves,opposite,outcome,play,positionKey,validateSetup
} from './chess.js';
import {
  KRK_FRAMES,KRK_GAMEPLAY_RELEASED,KRK_PARENT_SHA
} from './krk-local-witness.js';
import {
  krkConstructiveStep,auditKRKConstructiveStep
} from './krk-constructive-phases.js';
import {krkPrepState} from './krk-prep-controller.js';
import {krkPreparedWallChoice} from './krk-prepared-wall.js';

export const KRK_NONWALL_SOURCE_SHA=KRK_PARENT_SHA;
export const KRK_NONWALL_SCOPE='three direct source-proved entries; arbitrary legal roots are NOT covered';
const DIRECT_RULES=Object.freeze(['backrank','retreat','entry']);

function rootIsValid(s){
  return s?.material==='krk'&&Array.isArray(s.board)&&s.board.length===64&&
    ['w','b'].includes(s.turn)&&s.board.includes(s.turn+'R')&&
    Array.isArray(s.history)&&Array.isArray(s.log)&&
    Number.isInteger(s.halfmove)&&s.halfmove>=0&&
    s.history.at(-1)===positionKey(s.board,s.turn)&&
    validateSetup(s.board,'krk',s.turn)===null&&
    outcome(s.board,s.turn,s.history,s.halfmove).kind==='ongoing';
}

/**
 * A direct first move in the selected *source coordinate frame*. These
 * constructors promise a strict rank wall after EVERY actual legal weak
 * reply. The dispatcher prioritises narrower proof branches (protected
 * back rank, retreat) over the general clear vertical rook entry.
 */
export function krkNonWallEntryChoice(state,frame='id'){
  if(KRK_GAMEPLAY_RELEASED||!KRK_FRAMES.includes(frame)||!rootIsValid(state))
    return null;
  for(const ruleKey of DIRECT_RULES){
    const witness=krkConstructiveStep(state,ruleKey,frame);
    if(!witness)continue;
    const after=applyMove(state.board,witness.move);
    return Object.freeze({
      kind:'step',phase:'nonwall-'+ruleKey,sourcePhase:'nonwall-entry',
      rule:witness.rule,ruleKey,witness,move:witness.move,frame,
      sourceCommit:KRK_NONWALL_SOURCE_SHA,
      continuationPhase:Object.freeze({
        kind:'krk-nonwall-to-prepared-wall',frame,strong:state.turn,
        ruleKey,afterStrongKey:positionKey(after,opposite(state.turn)),
        historyLength:state.history.length+2,halfmove:state.halfmove+2
      }),
      isCompleteWinningPolicy:false,maxMatePlies:null
    });
  }
  return null;
}

/**
 * Binds the observed two legal plies to the exact first chosen action.
 * Prepared-wall play makes the next move only after verifying its OWN
 * strict-wall premises; missing proof phases return null.
 */
export function krkNonWallEntryContinue(state,tag){
  if(!rootIsValid(state)||tag?.kind!=='krk-nonwall-to-prepared-wall'||
    !KRK_FRAMES.includes(tag.frame)||!DIRECT_RULES.includes(tag.ruleKey)||
    state.turn!==tag.strong||
    tag.historyLength!==state.history.length||
    tag.halfmove!==state.halfmove||
    tag.afterStrongKey!==state.history.at(-2)||
    !krkPrepState(state,tag.frame))return null;
  return krkPreparedWallChoice(state,tag.frame);
}

/**
 * Only a PARTIAL fresh-root selector. If a certified wall exists, use its
 * ready-to-mate controller. Otherwise use an exact direct-entry lemma.
 * Frame order is fixed and picks the first *applicable proof*, not a scored
 * chess move. Unsupported roots fail closed.
 */
export function krkPartialRootChoice(state){
  if(KRK_GAMEPLAY_RELEASED||!rootIsValid(state))return null;
  for(const frame of KRK_FRAMES){
    const prepared=krkPreparedWallChoice(state,frame);
    if(prepared?.kind==='step')
      return Object.freeze({...prepared,rootPhase:'prepared-wall',frame});
  }
  for(const frame of KRK_FRAMES){
    const entry=krkNonWallEntryChoice(state,frame);
    if(entry)return Object.freeze({...entry,rootPhase:'direct-entry'});
  }
  return null;
}

/**
 * Falsification only: enumerate all legal defender responses and check each
 * entry reaches a valid next prepared-wall ACTION on the real board/history.
 * This inspection never chooses a move and does not prove global termination.
 */
export function auditKRKNonWallEntry(state,frame='id'){
  const entry=krkNonWallEntryChoice(state,frame);
  if(!entry)return {ok:false,reason:'outside direct entry premises',replies:0};
  const local=auditKRKConstructiveStep(state,entry.witness);
  if(!local.ok)return {ok:false,reason:'local source postcondition',replies:local.replies};
  const after=play(state,entry.move),replies=legalMoves(after.board,after.turn);
  if(!replies.length)return {ok:false,reason:'missing legal weak reply',replies:0};
  let largestPrepRank=0;
  for(const reply of replies){
    if(reply.capture||reply.piece!==after.turn+'K')
      return {ok:false,reason:'rook capture',failedReply:reply,replies:replies.length};
    const child=play(after,reply);
    const rank=krkPrepState(child,frame);
    const next=krkNonWallEntryContinue(child,entry.continuationPhase);
    if(!rank||next?.kind!=='step')
      return {ok:false,reason:'unproved post-entry wall continuation',
        failedReply:reply,replies:replies.length};
    largestPrepRank=Math.max(largestPrepRank,rank.rank);
  }
  return {ok:true,ruleKey:entry.ruleKey,replies:replies.length,
    largestPrepRank,entersStrictWall:true,
    isCompleteWinningPolicy:false,maxMatePlies:null};
}

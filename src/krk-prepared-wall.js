/**
 * KRK11 proof-derived PREP -> CENTRAL composition, unreleased.
 *
 * The only strong moves come from KRKExecutable.prepNext_sound or
 * KRKExecutable.CentralPolicy's tagged source actions. No engine,
 * tablebase, minimax, guessed first move or position atlas.
 *
 * The upstream KRK11 PreparedWallPolicy theorem is a static-game
 * all-defender certificate for a strict oriented rank wall. This
 * adapter carries actual board, halfmove and repetition history;
 * it still fails closed when existing FIDE-aware helpers refuse a
 * continuation. It is not yet a complete browser opponent.
 */
import {applyMove,legalMoves,opposite,outcome,positionKey,validateSetup}
  from './chess.js';
import {KRK_FRAMES,KRK_GAMEPLAY_RELEASED,krkTransformSquare}
  from './krk-local-witness.js';
import {krkPrepState,krkPrepChoice} from './krk-prep-controller.js';
import {krkCentralSequenceChoice,krkCentralStaticBound}
  from './krk-central-sequence.js';

export const KRK_PREPARED_POLICY_RULE =
  'EndgameChess.Rules.KRKExecutable.policy_prepared_wall_run';

/** The source theorem's static bound for a correctly oriented strict wall. */
export function krkPreparedWallStaticBound(state,frame='id'){
  const prep=krkPrepState(state,frame);
  if(!prep)return null;
  // prepNext preserves the original oriented rook rank until READY.
  // The central bound is the same function of that unchanged rank.
  const rook=state.board.indexOf(state.turn+'R');
  if(rook<0)return null;
  // The frame transform is an involution, so the transformed rook rank
  // is the source-coordinate rook rank used by the Lean theorem.
  const wallRank=Math.floor(krkTransformSquare(rook,frame)/8);
  if(wallRank<1||wallRank>6)return null;
  return Object.freeze({
    plies:2*prep.rank+18*(6-wallRank)+11,
    prepRank:prep.rank,wallRank,frame,
    rule:KRK_PREPARED_POLICY_RULE,
    scope:'source-selected preparation to central-wall mate; strict oriented rank wall',
    coversFIDEClaims:false,isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

const validState=s=>s?.material==='krk'&&Array.isArray(s.board)&&
  s.board.length===64&&Array.isArray(s.history)&&Array.isArray(s.log)&&
  Number.isInteger(s.halfmove)&&s.halfmove>=0&&
  s.history.at(-1)===positionKey(s.board,s.turn)&&
  validateSetup(s.board,'krk',s.turn)===null&&
  outcome(s.board,s.turn,s.history,s.halfmove).kind==='ongoing'&&
  s.board.includes(s.turn+'R');

/**
 * First call has no context and must start on a strict rank wall.
 * Each subsequent call must present the exact previous strong action's
 * continuation token after precisely one legal weak reply. A prep
 * continuation must decrease rank. Once READY, no prep action is reused.
 */
export function krkPreparedWallChoice(state,frame='id',context=null){
  if(!KRK_FRAMES.includes(frame)||!validState(state)||
    KRK_GAMEPLAY_RELEASED)return null;
  const ready=krkPrepState(state,frame);
  if(!ready)return null;
  if(context){
    if(context.kind!=='krk-prepared-continuation'||context.frame!==frame||
      context.strong!==state.turn||context.historyLength!==state.history.length||
      context.halfmove!==state.halfmove||
      context.afterStrongKey!==state.history.at(-2)||
      !['prep','central'].includes(context.stage))return null;
    if(context.stage==='prep'&&!(ready.rank<context.rankBefore))return null;
    if(context.stage==='central'&&!context.inner)return null;
  }
  const stage=context?.stage==='central'?'central':ready.ready?'central':'prep';
  let choice;
  if(stage==='prep'){
    if(context?.stage==='central')return null;
    choice=krkPrepChoice(state,frame);
    if(choice?.kind!=='step')return null;
  }else{
    // Central continuation has its own proof-phase tag, checked against
    // the exact board and turn by the KRK10 dispatcher.
    if(!context?.inner&&!ready.ready)return null;
    choice=krkCentralSequenceChoice(state,frame,context?.inner??null);
    if(choice?.kind!=='step')return null;
  }
  const after=applyMove(state.board,choice.move);
  const afterKey=positionKey(after,opposite(state.turn));
  return Object.freeze({
    ...choice,phase:stage==='prep'?'prepared-wall-rank-descent':choice.phase,
    rule:stage==='prep'?KRK_PREPARED_POLICY_RULE:choice.rule,
    sourcePhase:stage,frame,
    continuationPhase:Object.freeze({
      kind:'krk-prepared-continuation',
      stage,frame,strong:state.turn,rankBefore:ready.rank,
      afterStrongKey:afterKey,historyLength:state.history.length+2,
      halfmove:state.halfmove+2,
      inner:stage==='central'?choice.continuationPhase:null
    }),
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/**
 * KRK01: a complete, bounded *PREPARATION* phase on an oriented rank wall.
 * Not the complete KRK game policy: the subsequent READY / full-wall /
 * endgame finishing phases are still unavailable as an executable selector.
 *
 * R = 2 * prepDistance + 1{|R.file - weak.file| < 2}
 * Every complete strong+weak pair strictly decreases R, for ALL legal weak
 * replies. This is a derived local progress invariant, not a minimax rank.
 * The frozen Lean sources are KRKCentral.PrepPair / PrepDefinitions and
 * KRKForcing.WallActions, via the exact JS actions in constructive-phases.
 */
import {
  applyMove,coords,distance,findKing,legalMoves,opposite,outcome,
  positionKey,validateSetup
} from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare} from './krk-local-witness.js';
import {krkPrepDistance,krkConstructiveStep} from './krk-constructive-phases.js';

export const KRK_PREP_PHASE='Lean KRKCentral.prep_pair + WallActions.wallFarFile';

/** Deterministic rank, ONLY when the exact strong-turn oriented wall exists. */
export function krkPrepState(state,frame='id'){
  if(!KRK_FRAMES.includes(frame)||!state||state.material!=='krk'||
     !Array.isArray(state.board)||!Array.isArray(state.history)||
     !Number.isInteger(state.halfmove)||state.halfmove<0)return null;
  const b=state.board,rook=b.find(p=>p?.[1]==='R');
  if(!rook||state.turn!==rook[0]||validateSetup(b,'krk',state.turn)!==null||
     outcome(b,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  const strong=state.turn,weak=opposite(strong);
  const [sx,sy]=coords(krkTransformSquare(findKing(b,strong),frame));
  const [rx,ry]=coords(krkTransformSquare(b.indexOf(rook),frame));
  const [wx,wy]=coords(krkTransformSquare(findKing(b,weak),frame));
  if(!(sy<ry&&ry<wy))return null;
  const n=krkPrepDistance(ry,sx,sy),margin=Math.abs(rx-wx);
  const repair=margin<2?1:0,rank=2*n+repair;
  return Object.freeze({
    frame,prepDistance:n,rookFileMargin:margin,repairNeeded:repair===1,rank,
    ready:rank===0,remainingPrepPairsUpperBound:rank,
    remainingPrepPliesUpperBound:2*rank,
    parent:KRK_PARENT_SHA
  });
}

/**
 * A deterministic finite local controller, **not** a KRK winning policy.
 * It either produces an exact frozen action or proves the READY precondition.
 * It never invokes engines, tablebases, minimax, or a per-position atlas.
 */
export function krkPrepChoice(state,frame='id'){
  const info=krkPrepState(state,frame);
  if(!info)return null;
  if(info.ready){
    return Object.freeze({kind:'ready',phase:KRK_PREP_PHASE,parent:KRK_PARENT_SHA,
      isCompleteWinningPolicy:false,maxMatePlies:null,
      rankBefore:0,remainingPrepPliesUpperBound:0,
      condition:'K one rank below rook, K file 3 or 4, weak king above the wall and rook file margin >=2'});
  }
  const kind=info.repairNeeded?'wallFarRepair':'prep';
  const witness=krkConstructiveStep(state,kind,frame);
  if(!witness)return null;
  return Object.freeze({kind:'step',phase:KRK_PREP_PHASE,parent:KRK_PARENT_SHA,
    move:witness.move,witness,ruleKey:kind,frame,
    rankBefore:info.rank,remainingPrepPliesUpperBound:2*info.rank,
    isCompleteWinningPolicy:false,maxMatePlies:null});
}

/**
 * Proof-correspondence DIAGNOSTIC for the entire chosen strong move and ALL
 * legal weak responses. No game-tree search makes the choice; the rank
 * inequality is directly calculated after those responses.
 */
export function auditKRKPrepChoice(state,frame='id'){
  const choice=krkPrepChoice(state,frame);
  if(!choice)return {ok:false,replies:0};
  if(choice.kind==='ready')return {ok:true,replies:0,rankBefore:0,rankMaxAfter:0};
  const info=krkPrepState(state,frame);
  const b=applyMove(state.board,choice.move),weak=opposite(state.turn);
  const replies=legalMoves(b,weak);
  if(replies.length===0)return {ok:false,replies:0};
  let maxAfter=-1;
  for(const reply of replies){
    if(reply.capture||reply.piece!==weak+'K')
      return {ok:false,replies:replies.length};
    const next=applyMove(b,reply);
    const nextTurn=state.turn;
    const follow={...state,board:next,turn:nextTurn,
      history:state.history.concat([
        positionKey(b,weak),positionKey(next,nextTurn)
      ]),halfmove:state.halfmove+2};
    const rank=krkPrepState(follow,frame);
    if(!rank||rank.rank>=info.rank)
      return {ok:false,replies:replies.length,rankBefore:info.rank,
        failedReply:reply,rankAfter:rank?.rank??null};
    maxAfter=Math.max(maxAfter,rank.rank);
  }
  return {ok:true,replies:replies.length,
    rankBefore:info.rank,rankMaxAfter:maxAfter};
}

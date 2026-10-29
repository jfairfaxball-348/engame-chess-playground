/**
 * KRK08 (DRAFT): constructive lower-band central-to-EXIT continuation.
 *
 * This is the concrete orientation/wait/pursuit branch selection in Lean
 * KRKCentral.positive_bound, back_bound, back_even_bound and wait_even_bound.
 * Both move constructors were already proof-sourced in the local witness
 * layer (KRKForcing.WallActions). New upstream LowerPursuitPair makes the
 * king target and its all-defender rank decrease explicit.
 *
 * Important: an EXIT is NOT checkmate. No recursive global mate policy,
 * tablebase, search, arbitrary first-legal move, or engine is used to SELECT.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,positionKey,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare,krkLocalWitness}
  from './krk-local-witness.js';

export const KRK_LOWER_PURSUIT_RULE =
  'EndgameChess.Rules.KRKExecutable.lowerPursuitPair_sound';
export const KRK_LOWER_WAIT_RULE =
  'EndgameChess.Rules.krk_wall_rook_move';
export const KRK_LOWER_CENTRAL_BOUND =
  'EndgameChess.Rules.KRKCentral.central_bound';
export const KRK_LOWER_ROUTING_RULE =
  'EndgameChess.Rules.KRKExecutable.lowerRouting_terminates';
export const KRK_ROUTING_SOURCE_SHA = 'e9d0ecb47ef9461c933522e8d609597cea89958f';

const n=x=>Number.isInteger(x)&&x>=0;
const claim=s=>s.halfmove>=100||
  s.history.filter(k=>k===positionKey(s.board,s.turn)).length>=3;

function geometry(state,frame){
  if(!KRK_FRAMES.includes(frame)||state?.material!=='krk'||
    !Array.isArray(state.board)||state.board.length!==64||
    !Array.isArray(state.history)||!Array.isArray(state.log)||
    !n(state.halfmove)||
    state.history.at(-1)!==positionKey(state.board,state.turn)||
    validateSetup(state.board,'krk',state.turn)!==null||
    outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  const sk=findKing(state.board,state.turn);
  const rook=state.board.indexOf(state.turn+'R');
  const wk=findKing(state.board,opposite(state.turn));
  if(sk<0||rook<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rook,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  if(sy+1!==ry||ry>=wy)return null;
  const direction=wx>sx?'positive-x':wx<sx?'negative-x':'aligned';
  const orientedStrong=direction==='positive-x'?sx:7-sx;
  const orientedWeak=direction==='positive-x'?wx:7-wx;
  return {sx,sy,rx,ry,wx,wy,direction,orientedStrong,orientedWeak,
    margin:Math.abs(rx-wx),gap:Math.abs(sx-wx)};
}

function resultStep(state,frame,kind,g){
  const ruleKey=kind==='king-pursuit'?'pursuit':'wall';
  const witness=krkLocalWitness(state,ruleKey,frame);
  if(!witness?.move)return null;
  return Object.freeze({
    kind:'step',phase:kind,frame,move:witness.move,witness,
    rule:kind==='king-pursuit'?KRK_LOWER_PURSUIT_RULE:KRK_LOWER_WAIT_RULE,
    sourceRule:witness.rule,orientation:g.direction,
    orientedStrong:g.orientedStrong,remainingFileDistance:7-g.orientedStrong,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/** Lean lowerRoutingRank: file progress plus back-rook/parity debt. */
export function krkLowerRoutingRank(state,frame='id'){
  const g=geometry(state,frame);
  if(!g||g.direction==='aligned')return null;
  const backFile=g.direction==='positive-x'?g.rx:7-g.rx;
  const debt=backFile<=1?g.gap%2:2;
  return 6-g.orientedStrong+debt;
}

/** Exact orientation of the positive/back/wait Lean case split. */
export function krkLowerBandChoice(state,frame='id'){
  const g=geometry(state,frame);
  if(!g||claim(state)||state.halfmove+12>=100||
    g.wy!==g.ry+1||g.direction==='aligned'||
    g.orientedStrong<3||g.orientedStrong>6||
    g.orientedWeak<=g.orientedStrong)return null;
  return (g.gap>=2&&g.margin>=3)?
    resultStep(state,frame,'king-pursuit',g):
    resultStep(state,frame,'back-rook-wait',g);
}

/** Terminal of this PHASE: an ExitBound premise, not checkmate. */
export function krkLowerBandExit(state,frame='id'){
  const g=geometry(state,frame);
  if(!g||claim(state)||g.margin<2||g.sx<1||g.sx>6)return null;
  if(g.wy>=g.ry+2)return Object.freeze({
    kind:'handoff',phase:'upper-exit',rule:KRK_LOWER_CENTRAL_BOUND,
    frame,move:null,isCompleteWinningPolicy:false,maxMatePlies:null
  });
  if(g.sx===g.wx)return Object.freeze({
    kind:'handoff',phase:'aligned-exit',rule:KRK_LOWER_CENTRAL_BOUND,
    frame,move:null,isCompleteWinningPolicy:false,maxMatePlies:null
  });
  return null;
}

/**
 * Audit ALL replies of every step; selecting moves never uses traversal.
 * This audits one complete central LOWER-BAND -> Exit phase and rejects
 * unexpected replies, draw claims, cycles and over-budget paths.
 */
export function auditKRKLowerBandToExit(root,frame='id'){
  const fail=(reason,detail={})=>({
    ok:false,reason,rootReplies:0,defenderReplies:0,exitLeaves:0,
    maxPairs:0,isCompleteWinningPolicy:false,maxMatePlies:null,...detail
  });
  const first=geometry(root,frame);
  if(!first||!([3,4].includes(first.sx))||
    first.wy!==first.ry+1||claim(root)||root.halfmove+12>=100)
    return fail('outside legal, clock-safe lower central wall domain');
  if(first.direction==='aligned'){
    if(krkLowerBandExit(root,frame))return {
      ok:true,rootReplies:0,defenderReplies:0,exitLeaves:1,
      maxPairs:0,terminal:'aligned ExitBound (not mate)',
      isCompleteWinningPolicy:false,maxMatePlies:null
    };
    return fail('aligned rook rescue belongs to separate upstream lemma');
  }
  let defenderReplies=0,exitLeaves=0,maxPairs=0,rootReplies=0;
  const path=new Set();
  function visit(state,pairs,previous){
    const done=krkLowerBandExit(state,frame);
    if(done){exitLeaves++;maxPairs=Math.max(maxPairs,pairs);return null;}
    if(pairs>=6)return 'lower-band phase exceeds five full pairs';
    if(claim(state))return 'FIDE claim before exit';
    const g=geometry(state,frame);
    const next=krkLowerBandChoice(state,frame);
    if(!g||!next)return 'unproved lower-band continuation';
    if(previous&&!(krkLowerRoutingRank(state,frame)<previous.rank))
      return 'orientation or rank invariant failed';
    const key=positionKey(state.board,state.turn);
    if(path.has(key))return 'repeated lower-band position';
    path.add(key);
    const after=play(state,next.move);
    if(outcome(after.board,after.turn,after.history,after.halfmove).kind!=='ongoing'){
      path.delete(key);return 'unexpected terminal after selected source move';
    }
    const replies=legalMoves(after.board,after.turn);
    if(!replies.length){path.delete(key);return 'missing defender reply';}
    if(pairs===0)rootReplies=replies.length;
    for(const move of replies){
      defenderReplies++;
      if(move.capture||move.piece!==opposite(root.turn)+'K'){
        path.delete(key);return 'defender captured rook or changed material';
      }
      const child=play(after,move);
      if(claim(child)){path.delete(key);return 'defender can claim a draw';}
      const h=geometry(child,frame);
      if(!h||h.ry!==g.ry||h.sy!==g.sy||
        h.margin<2||h.wy<g.ry+1){
        path.delete(key);return 'rook wall or margin lost';
      }
      if(next.phase==='king-pursuit'){
        if(h.orientedStrong!==g.orientedStrong+1){
          // An aligned exit has no orientation; compare physical movement.
          const nextKing=h.sx;
          if(Math.abs(nextKing-g.sx)!==1){
            path.delete(key);return 'pursuit king did not move one oriented file';
          }
        }
      }else if(h.sx!==g.sx){
        path.delete(key);return 'rook wait unexpectedly moved king';
      }
      if(!krkLowerBandExit(child,frame)){
        if(h.direction!==g.direction||h.orientedWeak<=h.orientedStrong){
          path.delete(key);return 'orientation reversed before exit';
        }
        if(next.phase==='king-pursuit'&&
          h.orientedStrong<=g.orientedStrong){
          path.delete(key);return 'pursuit failed to decrease distance';
        }
      }
      const error=visit(child,pairs+1,{
        rank:krkLowerRoutingRank(state,frame)
      });
      if(error){path.delete(key);return error;}
    }
    path.delete(key);
    return null;
  }
  const error=visit(root,0,null);
  if(error)return fail(error,{rootReplies,defenderReplies,exitLeaves,maxPairs});
  return Object.freeze({
    ok:exitLeaves>0,rootReplies,defenderReplies,exitLeaves,maxPairs,
    terminal:'ExitBound premises reached (NOT checkmate)',
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

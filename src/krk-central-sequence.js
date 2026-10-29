/**
 * KRK08 experimental CENTRAL-WALL composition (UNRELEASED).
 *
 * This combines previously source-derived lower pursuit, central rescue,
 * rank advance and post-check restoration on the ORIGINAL chess state.
 * A successful bounded falsification audit is not a Lean proof of
 * universal game selection; do not wire to Maths gameplay.
 *
 * No search or tablebase makes moves: each move is selected by a named
 * frozen/new Lean constructor. Game-tree traversal is DIAGNOSTIC ONLY.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,positionKey,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare}
  from './krk-local-witness.js';
import {krkLowerBandChoice} from './krk-lower-band.js';
import {
  krkCentralAlignedRescueChoice,krkCentralBackRookChoice
} from './krk-central-boundary.js';
import {krkCentralUpperPhaseChoice} from './krk-central-upper-phase.js';
import {krkOppositionCheckChoice} from './krk-opposition.js';
import {krkRestorationChainNext} from './krk-restoration-chain.js';

function geometry(state,frame){
  if(!KRK_FRAMES.includes(frame)||state?.material!=='krk'||
    !Array.isArray(state.board)||state.board.length!==64||
    !Array.isArray(state.history)||!Array.isArray(state.log)||
    !Number.isInteger(state.halfmove)||state.halfmove<0||
    state.history.at(-1)!==positionKey(state.board,state.turn)||
    validateSetup(state.board,'krk',state.turn)!==null)return null;
  const sk=findKing(state.board,state.turn),rs=state.board.indexOf(state.turn+'R'),
    wk=findKing(state.board,opposite(state.turn));
  if(sk<0||rs<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rs,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  return {sx,sy,rx,ry,wx,wy,margin:Math.abs(rx-wx)};
}
const claim=s=>s.halfmove>=100||
  s.history.filter(k=>k===positionKey(s.board,s.turn)).length>=3;

/**
 * A conservative, restricted dispatcher from a FULL central wall and
 * its restoration descendants. It NEVER chooses a generic legal move.
 */
export function krkCentralSequenceChoice(state,frame='id'){
  const g=geometry(state,frame);
  if(!g||claim(state)||state.halfmove+12>=100||
    outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  // The upper/check rook lift leaves the king two ranks below the wall.
  // Existing KRK05 constructor restores an actual central FULL premise.
  if(g.sy+2===g.ry&&g.ry<g.wy){
    const restoration=krkRestorationChainNext(state,frame);
    return restoration?.kind==='step'?restoration:null;
  }
  // The last restoration alignment step may need one more king pair.
  if(g.sy+1===g.ry&&g.ry<g.wy&&![3,4].includes(g.sx)){
    const restoration=krkRestorationChainNext(state,frame);
    return restoration?.kind==='step'?restoration:null;
  }
  if(![3,4].includes(g.sx)||g.sy+1!==g.ry||g.ry>=g.wy)return null;
  // An aligned weak king with margin debt needs the special far rescue.
  if(g.sx===g.wx&&g.margin<2)
    return krkCentralAlignedRescueChoice(state,frame);
  // Nonaligned lower band: constructive chase / back-rook wait.
  if(g.wy===g.ry+1&&g.sx!==g.wx)
    return krkLowerBandChoice(state,frame);
  // An upper weak king and narrow rook margin first require orientation.
  if(g.wy>=g.ry+2&&g.margin<2)
    return krkCentralBackRookChoice(state,frame);
  // The aligned lower-band opposition move advances into restoration or
  // directly checkmates at the edge.
  if(g.wy===g.ry+1&&g.sx===g.wx)
    return krkOppositionCheckChoice(state,frame);
  // Upper READY: advance rook rank, then restore the full central wall.
  if(g.wy>=g.ry+2&&g.margin>=2)
    return krkCentralUpperPhaseChoice(state,frame);
  return null;
}

/**
 * Universal all-defender falsification on a given central root. Stops
 * only on actual mate; any draw, rook capture, claim or unsupported child
 * fails closed. No chess move is selected via this recursive traversal.
 */
export function auditKRKCentralSequence(root,frame='id',maxNodes=40000){
  const bad=(reason,data={})=>({
    ok:false,reason,nodes:0,terminalMates:0,maximumPlies:0,
    isCompleteWinningPolicy:false,maxMatePlies:null,...data
  });
  const g=geometry(root,frame);
  if(!g||![3,4].includes(g.sx)||g.sy+1!==g.ry||
    g.ry>=g.wy||g.ry>6||claim(root)||root.halfmove!==0)
    return bad('outside fresh full central-wall scope');
  let nodes=0,terminalMates=0,maximumPlies=0;
  const path=new Set();
  function visit(s,plies){
    if(++nodes>maxNodes)return 'diagnostic node cap reached';
    maximumPlies=Math.max(maximumPlies,plies);
    const o=outcome(s.board,s.turn,s.history,s.halfmove);
    if(o.kind==='mate'){
      if(o.winner!==root.turn)return 'wrong winner';
      terminalMates++;return null;
    }
    if(o.kind!=='ongoing'||claim(s))return 'draw, stalemate or claim';
    if(plies>=98)return 'FIDE-safe bound exceeded';
    const key=positionKey(s.board,s.turn);
    if(path.has(key))return 'repeated position';
    const move=krkCentralSequenceChoice(s,frame);
    if(!move||move.kind!=='step'||!move.move)
      return 'no proved constructive next move';
    path.add(key);
    const after=play(s,move.move);
    const next=outcome(after.board,after.turn,after.history,after.halfmove);
    if(next.kind==='mate'){
      if(next.winner!==root.turn){path.delete(key);return 'incorrect mate winner';}
      terminalMates++;maximumPlies=Math.max(maximumPlies,plies+1);
      path.delete(key);return null;
    }
    if(next.kind!=='ongoing'){path.delete(key);return 'stalemate or automatic draw after strong move';}
    const replies=legalMoves(after.board,after.turn);
    if(!replies.length){path.delete(key);return 'missing legal defender reply';}
    for(const reply of replies){
      if(reply.capture||reply.piece!==opposite(root.turn)+'K'){
        path.delete(key);return 'rook capture or unproved defending move';
      }
      const child=play(after,reply);
      const error=visit(child,plies+2);
      if(error){path.delete(key);return error;}
    }
    path.delete(key);
    return null;
  }
  const error=visit(root,0);
  if(error)return bad(error,{nodes,terminalMates,maximumPlies});
  return {
    ok:terminalMates>0,nodes,terminalMates,maximumPlies,
    terminal:'actual strong-side checkmate in tested central roots',
    isCompleteWinningPolicy:false,maxMatePlies:null
  };
}

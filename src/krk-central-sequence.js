/**
 * KRK09 phase-indexed CENTRAL-WALL composition (UNRELEASED).
 *
 * LowerRouting.lean proves all-reply lower-phase termination and the
 * off-centre upper lift. Explicit continuation tags distinguish pursuit,
 * restoration after a lift, centre alignment, and full central re-entry.
 * The original board, clocks and history remain attached throughout.
 * A successful bounded falsification audit is not a Lean proof of
 * universal game selection; do not wire to Maths gameplay.
 *
 * No search or tablebase makes moves: each move is selected by a named
 * frozen/new Lean constructor. Game-tree traversal is DIAGNOSTIC ONLY.
 */
import {
  applyMove,coords,findKing,legalMoves,opposite,outcome,play,positionKey,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare}
  from './krk-local-witness.js';
import {krkLowerBandChoice,krkLowerBandExit} from './krk-lower-band.js';
import {krkConstructiveStep} from './krk-constructive-phases.js';
import {
  krkCentralAlignedRescueChoice,krkCentralBackRookChoice
} from './krk-central-boundary.js';
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
 * A restricted dispatcher from a FULL central wall and tagged descendants.
 * Context is returned with each move, then supplied after the weak reply.
 * This JS composition has no formal whole-game clock bound yet.
 */
export function krkCentralSequenceChoice(state,frame='id',context=null){
  const g=geometry(state,frame);
  if(!g||claim(state)||state.halfmove+12>=100||
    outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  let stage='central';
  if(context){
    // A tag is tied to the exact strong move and its original history.
    if(context.frame!==frame||context.strong!==state.turn||
      context.afterStrongKey!==state.history.at(-2)||
      context.historyLength!==state.history.length||
      context.halfmove!==state.halfmove||context.wallRank!==g.ry||
      !['central','lower','restore','centre'].includes(context.stage))return null;
    stage=context.stage;
  }else if(![3,4].includes(g.sx)||g.sy+1!==g.ry||g.ry>=g.wy){
    return null;
  }
  const emit=(choice,nextStage,orientation=null)=>{
    if(choice?.kind!=='step'||!choice.move)return null;
    const after=applyMove(state.board,choice.move);
    const afterStrongKey=positionKey(after,opposite(state.turn));
    if(state.history.filter(k=>k===afterStrongKey).length>=2)return null;
    const [,wallRank]=coords(krkTransformSquare(
      after.indexOf(state.turn+'R'),frame));
    return Object.freeze({...choice,continuationPhase:Object.freeze({
      stage:nextStage,orientation,frame,strong:state.turn,wallRank,
      afterStrongKey,
      historyLength:state.history.length+2,halfmove:state.halfmove+2
    })});
  };
  if(stage==='restore'){
    if(g.sy+2!==g.ry||g.ry>=g.wy)return null;
    const choice=krkRestorationChainNext(state,frame);
    if(choice?.kind!=='step')return null;
    const after=applyMove(state.board,choice.move);
    const [sx,sy]=coords(krkTransformSquare(findKing(after,state.turn),frame));
    return emit(choice,sy===g.sy?'restore':[3,4].includes(sx)?'central':'centre');
  }
  if(stage==='centre'){
    if(g.sy+1!==g.ry||g.ry>=g.wy||![2,5].includes(g.sx))return null;
    return emit(krkRestorationChainNext(state,frame),'central');
  }
  if(g.sy+1!==g.ry||g.ry>=g.wy||g.sx<1||g.sx>6)return null;
  if(stage==='central'){
    if(![3,4].includes(g.sx))return null;
    if(g.sx===g.wx&&g.margin<2)
      return emit(krkCentralAlignedRescueChoice(state,frame),'central');
    if(g.wy>=g.ry+2&&g.margin<2)
      return emit(krkCentralBackRookChoice(state,frame),'central');
  }else{
    const exit=krkLowerBandExit(state,frame);
    if(!exit){
      const orientation=g.wx>g.sx?'positive-x':'negative-x';
      if(context.orientation!==orientation)return null;
    }
  }
  if(g.wy===g.ry+1&&g.sx!==g.wx){
    const choice=krkLowerBandChoice(state,frame);
    return emit(choice,'lower',choice?.orientation);
  }
  if(g.wy===g.ry+1&&g.sx===g.wx)
    return emit(krkOppositionCheckChoice(state,frame),'restore');
  if(g.wy>=g.ry+2&&g.margin>=2){
    // offCentreUpper_sound / rank_two_pair allows ALL interior king files.
    const witness=krkConstructiveStep(state,'rankTwo',frame);
    return emit(witness&&{...witness,kind:'step',phase:'exit-upper-lift',
      rule:'EndgameChess.Rules.KRKExecutable.offCentreUpper_sound'},'restore');
  }
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
    g.ry>=g.wy||g.ry>6||claim(root)||root.halfmove!==0||root.history.length!==1)
    return bad('outside fresh full central-wall scope');
  let nodes=0,terminalMates=0,maximumPlies=0;
  const path=new Set();
  function visit(s,plies,context=null){
    if(++nodes>maxNodes)return 'diagnostic node cap reached';
    maximumPlies=Math.max(maximumPlies,plies);
    const o=outcome(s.board,s.turn,s.history,s.halfmove);
    if(o.kind==='mate'){
      if(o.winner!==root.turn)return 'wrong winner';
      terminalMates++;return null;
    }
    if(o.kind!=='ongoing'||claim(s))return 'draw, stalemate or claim';
    if(plies>=98)return 'FIDE-safe bound exceeded';
    // The same board may occur once during centre restoration and later
    // during pursuit. Those have different certified next actions. FIDE
    // threefold still counts the actual board/turn through claim(s).
    const key=positionKey(s.board,s.turn)+'|'+(context?.stage??'central')+
      '|'+(context?.orientation??'');
    if(path.has(key))return 'repeated position';
    const move=krkCentralSequenceChoice(s,frame,context);
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
    if(claim(after)){path.delete(key);return 'defender draw claim after strong move';}
    const replies=legalMoves(after.board,after.turn);
    if(!replies.length){path.delete(key);return 'missing legal defender reply';}
    for(const reply of replies){
      if(reply.capture||reply.piece!==opposite(root.turn)+'K'){
        path.delete(key);return 'rook capture or unproved defending move';
      }
      const child=play(after,reply);
      const error=visit(child,plies+2,move.continuationPhase);
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

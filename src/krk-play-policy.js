/**
 * KRK Maths demonstration opponent.
 *
 * The player is ALWAYS the lone king. The computer is ALWAYS king+rook.
 * Strong-side actions come from the constructive coordinate functions extracted
 * from the endgame-chess Lean development; no Stockfish, tablebase, minimax,
 * network access, or learned position evaluation.
 *
 * A practical, clock-independent demonstration is not a certification of the
 * mathematical 97/98-ply bound or the choice-dependent strong WDL50 predicate.
 * For a root not admitted by the source-derived constructive phases we may
 * use an explicitly labelled geometric *setup* move (rook far from enemy,
 * king closing distance), never misrepresenting it as a Lean-proved action.
 */
import {
  applyMove,coords,distance,findKing,inCheck,legalMoves,opposite,outcome,
  squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkLocalWitness} from './krk-local-witness.js';
import {krkImmediateMateWitness} from './krk-immediate-witness.js';
import {krkWallClimbChoice} from './krk-wall-climb.js';
import {krkConstructiveStep} from './krk-constructive-phases.js';
import {krkReadyCutTempoChoice} from './krk-ready-cut-tempo.js';
import {krkWidePivotChoice} from './krk-wide-pivot.js';
import {krkGuardedEntryChoice} from './krk-guarded-entry.js';
import {krkColumnKingChoice} from './krk-column-king.js';
import {
  krkOppositionCheckChoice,krkOppositionFollowChoice
} from './krk-opposition.js';

export const KRK_POLICY_MODE='constructive-geometric-demonstration';
const diff=(a,b)=>Math.abs(a-b);
const isRook=(p,strong)=>p===strong+'R';

/** Avoid offering a rook to immediate capture or manufacturing stalemate.
 * This inspects one legal defensive move as a safety check only; it does not
 * search a winning game tree or import a tablebase.
 */
function safeMove(state,move,strong){
  if(!move)return false;
  const b=applyMove(state.board,move),weak=opposite(strong);
  const replies=legalMoves(b,weak);
  if(!replies.length)return inCheck(b,weak);
  return !replies.some(m=>isRook(m.capture,strong));
}
function wrap(witness,source,frame){
  return {
    move:witness.move,origin:'krk-constructive-geometry',mode:KRK_POLICY_MODE,
    rule:witness.rule||witness.phase||source,
    reason:'Constructive geometric phase: '+source,
    frame,proofContext:witness.proofContext||null,
    certifiedLocalStep:true,globalPlyBound:null
  };
}
function isMove(w){return w?.kind==='step'||Boolean(w?.move);}

function possibleWitnesses(state,frame){
  const g=krkGuardedEntryChoice(state,frame);
  const f=krkOppositionFollowChoice(state,state.krkProofContext);
  const m=krkImmediateMateWitness(state);
  const p=krkWidePivotChoice(state,frame);
  const t=krkReadyCutTempoChoice(state,frame);
  const check=krkOppositionCheckChoice(state,frame);
  const climb=krkWallClimbChoice(state,frame);
  const col=krkColumnKingChoice(state,frame);
  const root=[
    ['follow opposition',f],
    ['immediate mate',m],
    ['guarded king entry',g],
    ['protected wide rook cut',p],
    ['narrow ready rook tempo',t],
    ['opposed-king rook check',check],
    ['central wall climb',climb],
    ['column centralisation',col]
  ];
  // Source setup steps are not selected heuristically: apply the frozen
  // construction in its own specified geometry and orientation.
  for(const rule of ['entry','backrank','retreat','backrankSetup',
      'offrankRepair','wallFarRepair','rankAdvance','rankTwo']){
    root.push(['KRKSetup '+rule,krkConstructiveStep(state,rule,frame)]);
  }
  for(const rule of ['rescue','pursuit']){
    root.push(['KRKForcing '+rule,krkLocalWitness(state,rule,frame)]);
  }
  return root;
}

/** Last-resort geometric *setup* (not falsely called a proof witness).
 * Uses the same safe rook / king pursuit primitives as the parent's
 * KRKSetup and KRKCentral constructions.
 * Never selects a move that permits the weak king to capture the rook.
 */
function geometricSetup(state,strong,legal){
  const weak=opposite(strong),b=state.board,
    sk=findKing(b,strong),wk=findKing(b,weak),rs=b.indexOf(strong+'R');
  const candidates=legal.filter(m=>safeMove(state,m,strong));
  if(!candidates.length)return null;
  const before=distance(sk,wk);
  const [kx,ky]=coords(sk),[wx,wy]=coords(wk);
  const king=candidates.filter(m=>m.from===sk);
  const approach=king.filter(m=>distance(m.to,wk)<before)
    .sort((a,c)=>distance(a.to,wk)-distance(c.to,wk)||a.to-c.to);
  if(approach.length){
    return {move:approach[0],origin:'krk-geometric-setup',mode:KRK_POLICY_MODE,
      rule:'KRKCentral.KingBelow / approach geometry (not a certified global selector)',
      reason:'Bring the strong king closer while keeping the rook out of capture.',
      certifiedLocalStep:false,globalPlyBound:null};
  }
  const rook=candidates.filter(m=>m.from===rs);
  // Source-derived wall geometry: put the rook between the kings along an
  // axis with at least one free rank/file and a safe escape file.
  const target=[];
  if(diff(ky,wy)>=2){
    const y=ky+(wy>ky?1:-1);
    for(let x=0;x<8;x++)target.push(squareAt(x,y));
  }
  if(diff(kx,wx)>=2){
    const x=kx+(wx>kx?1:-1);
    for(let y=0;y<8;y++)target.push(squareAt(x,y));
  }
  const entry=rook.filter(m=>target.includes(m.to))
    .sort((a,c)=>distance(c.to,wk)-distance(a.to,wk)||a.to-c.to);
  if(entry.length)return {move:entry[0],origin:'krk-geometric-setup',
    mode:KRK_POLICY_MODE,rule:'KRKSetup clear-axis wall geometry (practical selector)',
    reason:'Place the rook across a protected separating rank or file.',
    certifiedLocalStep:false,globalPlyBound:null};
  const far=rook.sort((a,c)=>distance(c.to,wk)-distance(a.to,wk)||a.to-c.to);
  if(far.length)return {move:far[0],origin:'krk-geometric-setup',
    mode:KRK_POLICY_MODE,rule:'KRKForcing rook-far rescue geometry (practical selector)',
    reason:'Keep the rook distant until the king can build a wall.',
    certifiedLocalStep:false,globalPlyBound:null};
  // The king is not allowed to walk adjacent to the enemy; this final step
  // is an explicitly marked non-certifying, legal and rook-safe setup step.
  return {move:candidates[0],origin:'krk-geometric-setup',
    mode:KRK_POLICY_MODE,rule:'Legal rook-safe geometric setup (unproved step)',
    reason:'Maintain a legal, rook-safe position while seeking a supported phase.',
    certifiedLocalStep:false,globalPlyBound:null};
}

/** At the outer edge, advance the escorting king before moving the wall
 * sideways again. This implements the practical 'corner escort' phase:
 * each step reduces the file+rank separation and keeps the rook safe.
 * No claim of a formal finite bound is attached to this move.
 */
function cornerEscort(state,strong){
  const b=state.board,weak=opposite(strong);
  const wk=findKing(b,weak),sk=findKing(b,strong);
  const [wx,wy]=coords(wk),[sx,sy]=coords(sk);
  if(!(wx===0||wx===7||wy===0||wy===7))return null;
  const manhattan=(a,c)=>{const [x,y]=coords(a),[u,v]=coords(c);return diff(x,u)+diff(y,v);};
  const initial=manhattan(sk,wk);
  const moves=legalMoves(b,strong).filter(m=>m.from===sk&&
     safeMove(state,m,strong)&&manhattan(m.to,wk)<initial);
  // The first preferred approach is an ordinary forward king step toward
  // the confined king, not an arbitrary rook swing across the board.
  moves.sort((a,c)=>manhattan(a.to,wk)-manhattan(c.to,wk)||
     distance(c.to,wk)-distance(a.to,wk)||a.to-c.to);
  if(!moves.length)return null;
  return {move:moves[0],origin:'krk-geometric-setup',
    mode:KRK_POLICY_MODE,rule:'KRKCentral king approach / corner escort',
    reason:'Move the supporting king toward the confined lone king while protecting the rook.',
    certifiedLocalStep:false,globalPlyBound:null};
}

export function chooseKRKDecision(state,strong){
  if(!state||state.material!=='krk'||state.turn!==strong||
    !['w','b'].includes(strong)||!Array.isArray(state.board)||!Array.isArray(state.history))return null;
  if(!state.board.includes(strong+'R')||
    validateSetup(state.board,'krk',strong)!==null||
    outcome(state.board,strong,state.history,state.halfmove).kind!=='ongoing')return null;
  const legal=legalMoves(state.board,strong);
  if(!legal.length)return null;
  const frames=[...new Set([state.krkFrame,...KRK_FRAMES].filter(f=>KRK_FRAMES.includes(f)))];
  // An immediate geometrically proved mate takes precedence over setup.
  const mate=krkImmediateMateWitness(state);
  if(mate)return {...wrap(mate,'exact MateNow',state.krkFrame||'id'),frame:state.krkFrame||'id'};
  // Complete the prior frozen four-ply opposition sequence before reorienting.
  if(state.krkProofContext){
    const follow=krkOppositionFollowChoice(state,state.krkProofContext);
    if(follow&&safeMove(state,follow.move,strong))
      return wrap(follow,'continued opposition king-up',state.krkProofContext.frame);
  }
  const escort=cornerEscort(state,strong);
  if(escort)return escort;
  for(const frame of frames){
    for(const [source,w] of possibleWitnesses(state,frame)){
      if(!isMove(w)||!safeMove(state,w.move,strong))continue;
      if(!legal.some(m=>m.from===w.move.from&&m.to===w.move.to))continue;
      return wrap(w,source,frame);
    }
  }
  return geometricSetup(state,strong,legal);
}

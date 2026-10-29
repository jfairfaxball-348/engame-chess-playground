/**
 * KRK01: constructive, quantified phase STEPS from the frozen KRK Lean proof.
 *
 * Still NOT a total move policy. The caller must select the named theorem
 * and a supported involutive frame; this module neither auto-dispatches nor
 * promises a global mate bound. No engine, search, tablebase or heuristics.
 *
 * Source: engame-chess@e7de0930fc61caeb11795cf3c10fde11e4774a40
 */
import {
  applyMove,coords,distance,findKing,legalMoves,opposite,outcome,squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare} from './krk-local-witness.js';

export const KRK_CONSTRUCTIVE_RULES=Object.freeze({
  entry:'EndgameChess.Rules.krk_clear_vertical_entry_force',
  prep:'EndgameChess.Rules.KRKCentral.prep_pair',
  rankTwo:'EndgameChess.Rules.KRKCentral.rank_two_pair',
  rankAdvance:'EndgameChess.Rules.krk_rank_advance',
  retreat:'EndgameChess.Rules.krk_same_rank_retreat_force',
  backrank:'EndgameChess.Rules.krk_backrank_protected_force'
});
const diff=(a,b)=>Math.abs(a-b);
export const krkCentreDistance=x=>x<3?3-x:x>4?x-4:0;
export const krkPrepDistance=(r,sx,sy)=>Math.max(r-(sy+1),krkCentreDistance(sx));

function framed(state,iso){
  if(!KRK_FRAMES.includes(iso)||!state||state.material!=='krk'||
    !Array.isArray(state.board)||!Array.isArray(state.history)||
    !Number.isInteger(state.halfmove)||state.halfmove<0)return null;
  const b=state.board;
  const rook=b.find(p=>p?.[1]==='R');
  if(!rook||state.turn!==rook[0]||
    validateSetup(b,'krk',rook[0])!==null||
    outcome(b,state.turn,state.history,state.halfmove).kind!=='ongoing')return null;
  const strong=rook[0],weak=opposite(strong);
  const original={sk:findKing(b,strong),rs:b.indexOf(rook),wk:findKing(b,weak)};
  const [sx,sy]=coords(krkTransformSquare(original.sk,iso));
  const [rx,ry]=coords(krkTransformSquare(original.rs,iso));
  const [wx,wy]=coords(krkTransformSquare(original.wk,iso));
  return {b,strong,weak,original,sx,sy,rx,ry,wx,wy,iso};
}
function emit(state,f,rule,from,to,premises,postcondition,rank){
  const src=krkTransformSquare(from,f.iso),dst=krkTransformSquare(to,f.iso);
  const move=legalMoves(f.b,f.strong).find(m=>m.from===src&&m.to===dst);
  if(!move)return null;
  return Object.freeze({
    move,origin:'lean-constructive-phase',rule:KRK_CONSTRUCTIVE_RULES[rule],
    ruleKey:rule,isometry:f.iso,parent:KRK_PARENT_SHA,
    premises,postcondition,localRank:rank,
    maxMatePlies:null,isCompleteWinningPolicy:false,
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length
  });
}

/** A named quantified geometric construction, never an automatic fallback. */
export function krkConstructiveStep(state,rule,isometry='id'){
  const f=framed(state,isometry);
  if(!f||!Object.hasOwn(KRK_CONSTRUCTIVE_RULES,rule))return null;
  const {sx,sy,rx,ry,wx,wy}=f;
  const rook=squareAt(rx,ry),king=squareAt(sx,sy);
  if(rule==='entry'){
    // ClearEntry: strong king at least two ranks below weak; distinct rook file
    // or rook rank already above strong king. A distant rook enters wall rank.
    if(sy+2>wy||diff(rx,wx)<2||!(rx!==sx||sy<ry)||ry===sy+1)return null;
    return emit(state,f,rule,rook,squareAt(rx,sy+1),
      'K.y+2<=k.y; |R.x-k.x|>=2; R.x!=K.x or K.y<R.y; R.y!=K.y+1',
      'After every weak reply, K.y<R.y<k.y; the rook may become threatened and require an immediate rescue.',
      {type:'wall-entry',targetRank:sy+1});
  }
  if(rule==='prep'){
    // PrepDefinitions/PrepPair: a deterministic king step closer to a
    // centred ready wall. prepDistance decreases by EXACTLY one at the move.
    if(!(sy<ry&&ry<wy)||diff(rx,wx)<2)return null;
    const n=krkPrepDistance(ry,sx,sy);
    if(n===0)return null;
    const nx=sx<3?sx+1:sx>4?sx-1:sx;
    const ny=sy+1<ry?sy+1:sy;
    if(krkPrepDistance(ry,nx,ny)!==n-1)return null;
    return emit(state,f,rule,king,squareAt(nx,ny),
      'K.y<R.y<k.y; rook file margin >=2; prepDistance>0',
      'King advances to centre and/or wall; all weak replies preserve wall, weak file displacement <=1.',
      {type:'prepDistance',before:n,after:n-1});
  }
  if(rule==='rankTwo'||rule==='rankAdvance'){
    if(!(sy<ry&&ry+2<=wy)||diff(rx,wx)<(rule==='rankAdvance'?3:2))return null;
    if(rule==='rankAdvance'&&sy+2>ry)return null;
    return emit(state,f,rule,rook,squareAt(rx,ry+1),
      rule==='rankAdvance'?'K.y+2<=R.y; R.y+2<=k.y; rook file margin >=3':
        'K.y<R.y; R.y+2<=k.y; rook file margin >=2',
      rule==='rankAdvance'?
        'Every weak reply retains a DISTANT wall; 7-new rook rank is strictly lower.':
        'Every weak reply is above raised rook wall; file displacement of weak king <=1.',
      {type:'wallHeight',before:7-ry,after:6-ry,guaranteedDistant:rule==='rankAdvance'});
  }
  if(rule==='retreat'){
    if(!(sy===ry&&sy>0&&sy+2<=wy))return null;
    return emit(state,f,rule,king,squareAt(sx,sy-1),
      'K.y=R.y>0; K.y+2<=k.y; no incoming weak check',
      'After every weak reply, K.y<R.y<k.y; no guarantee of post-reply distant-rook safety.',
      {type:'same-rank-retreat',afterKingRank:sy-1});
  }
  if(rule==='backrank'){
    if(!(sy===0&&ry===0&&wy>=2&&diff(sx,rx)===1))return null;
    return emit(state,f,rule,rook,squareAt(rx,1),
      'K.y=R.y=0; k.y>=2; |K.x-R.x|=1; no incoming weak check',
      'Rook steps behind weak king, protected by K; every weak reply retains wall.',
      {type:'protected-backrank-entry',afterRookRank:1});
  }
  return null;
}

/** Exhaustive LEGAL DEFENDER REPLY check of a local lemma, not a global solver. */
export function auditKRKConstructiveStep(state,witness){
  const f=framed(state,witness?.isometry);
  if(!f||!witness||witness.isCompleteWinningPolicy||
    witness.parent!==KRK_PARENT_SHA)return {ok:false,replies:0};
  const expected=krkConstructiveStep(state,witness.ruleKey,witness.isometry);
  if(!expected||witness.move.from!==expected.move.from||
    witness.move.to!==expected.move.to)return {ok:false,replies:0};
  const next=applyMove(f.b,expected.move);
  const replies=legalMoves(next,f.weak);
  if(replies.length===0)return {ok:false,replies:0};
  const oldWx=f.wx,oldWy=f.wy;
  const valid=replies.every(reply=>{
    if(reply.piece!==f.weak+'K'||reply.capture)return false;
    const b=applyMove(next,reply);
    const sk=findKing(b,f.strong),rs=b.indexOf(f.strong+'R');
    const wk=findKing(b,f.weak);
    if(sk<0||rs<0||wk<0)return false;
    const [sx,sy]=coords(krkTransformSquare(sk,f.iso));
    const [rx,ry]=coords(krkTransformSquare(rs,f.iso));
    const [wx,wy]=coords(krkTransformSquare(wk,f.iso));
    if(!(sy<ry&&ry<wy)||diff(wx,oldWx)>1||diff(wy,oldWy)>1)return false;
    if(witness.ruleKey==='entry'||witness.ruleKey==='retreat'){
      // The Lean proof establishes an oriented WALL (and ForceMate from it),
      // not a globally distant rook after EVERY defending move. A close rook
      // must be rescued on the next strong turn before giving away the move.
      return true;
    }
    if(witness.ruleKey==='backrank'){
      return distance(sk,rs)===1;
    }
    if(witness.ruleKey==='prep'){
      return krkPrepDistance(ry,sx,sy)===expected.localRank.after &&
        diff(wx,oldWx)<=1;
    }
    if(witness.ruleKey==='rankTwo'||witness.ruleKey==='rankAdvance'){
      return ry===f.ry+1&&
        (witness.ruleKey!=='rankAdvance'||distance(rs,wk)>=2);
    }
    return false;
  });
  return {ok:valid,replies:replies.length};
}

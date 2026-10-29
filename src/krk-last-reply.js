/**
 * KRK01 — exact LastReply geometry; complete two-ply terminal CASE only.
 * Frozen Lean: KRKLastReply.HorizontalLast, LastReply, model_last_iff.
 * Transposed board case proved in model_last_iff; NOT a global KRK policy.
 * Parent source: engame-chess@e7de0930fc61caeb11795cf3c10fde11e4774a40
 */
import {
  applyMove,coords,distance,findKing,legalMoves,opposite,outcome,
  positionKey,validateSetup
} from './chess.js';
import {KRK_PARENT_SHA} from './krk-local-witness.js';
import {krkImmediateMateWitness} from './krk-immediate-witness.js';

export const KRK_LAST_REPLY_RULE='EndgameChess.Rules.KRKLastReply.model_last_iff';

/** Direct transcription of KRKLastReply.HorizontalLast (no move search). */
export function krkHorizontalLast(sk,rs,wk){
  const [sx,sy]=sk,[rx,ry]=rs,[wx,wy]=wk;
  if(!((wy===0&&sy===2)||(wy===7&&sy===5)) || ry===wy)return false;
  if(wx===0&&sx===1&&rx>=3)return true;
  if(wx===7&&sx===6&&rx<=4)return true;
  if(wx<=0||wx>=7)return false;
  return (
    ((sx===wx+1||(wx===6&&sx===6)) && rx+1===wx) ||
    ((sx+1===wx||(wx===1&&sx===1)) && rx===wx+1)
  );
}

/** LastReply := SafeRook ∧ (HorizontalLast ∨ transposed HorizontalLast). */
export function krkLastReplyGeometry(sk,rs,wk){
  if(!Array.isArray(sk)||!Array.isArray(rs)||!Array.isArray(wk) ||
    [sk,rs,wk].some(s=>s.length!==2||s.some(x=>!Number.isInteger(x)||x<0||x>7)))
    return null;
  const dist=(a,b)=>Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
  const safe=dist(rs,wk)>=2||dist(rs,sk)===1;
  if(!safe||dist(sk,wk)<2 || sk.join()===rs.join() ||
    sk.join()===wk.join()||rs.join()===wk.join())return null;
  if(krkHorizontalLast(sk,rs,wk))return 'horizontal';
  const swap=([x,y])=>[y,x];
  if(krkHorizontalLast(swap(sk),swap(rs),swap(wk)))return 'vertical';
  return null;
}

/**
 * The theorem's exact terminal case applies with fresh board and clock.
 * Enumeration of all legal defender replies is used as an additional
 * fail-closed DIAGNOSTIC, not a minimax/search-based move-selection method.
 * No claims about other positions, repeated histories or a global 98 cap.
 */
export function krkLastReplyWitness(state){
  if(!state||state.material!=='krk'||!Array.isArray(state.board) ||
    !Array.isArray(state.history)||state.history.length!==1||
    state.halfmove!==0)return null;
  const b=state.board;
  const rook=b.find(p=>p&&p[1]==='R');
  if(!rook)return null;
  const strong=rook[0],weak=opposite(strong);
  if(state.turn!==weak||state.history[0]!==positionKey(b,weak)||
    validateSetup(b,'krk',weak)!==null ||
    outcome(b,weak,state.history,0).kind!=='ongoing')return null;
  const sk=findKing(b,strong),rs=b.indexOf(rook),wk=findKing(b,weak);
  if(sk<0||rs<0||wk<0||distance(sk,wk)<2)return null;
  const axis=krkLastReplyGeometry(coords(sk),coords(rs),coords(wk));
  if(!axis)return null;
  const replies=legalMoves(b,weak);
  if(!replies.length)return null;
  const certificates=[];
  for(const response of replies){
    if(response.capture || response.piece!==weak+'K')return null;
    const next=applyMove(b,response);
    const witness=krkImmediateMateWitness({
      board:next,turn:strong,material:'krk',halfmove:1,
      history:[...state.history,positionKey(next,strong)]
    });
    if(!witness||witness.maxMatePlies!==1)return null;
    certificates.push(Object.freeze({
      responseFrom:response.from,responseTo:response.to,
      matingMove:witness.move,mateCase:witness.case,rule:witness.rule
    }));
  }
  return Object.freeze({
    origin:'lean-last-reply',rule:KRK_LAST_REPLY_RULE,parent:KRK_PARENT_SHA,
    axis,maxMatePlies:2,isCompleteWinningPolicy:false,
    inputHalfmove:0,inputHistoryLength:1,
    defenderReplyCount:certificates.length,
    // These lines certify all responses of THIS root, not repeated gameplay.
    branches:Object.freeze(certificates),
    reason:'The frozen LastReply criterion proves that every legal weak-king reply permits a direct MateNow rook checkmate.'
  });
}

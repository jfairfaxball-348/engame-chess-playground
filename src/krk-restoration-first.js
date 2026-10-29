/**
 * KRK05 (UNRELEASED): a constructive restoration FIRST PAIR only.
 *
 * Source: EndgameChess.Rules.KRKExecutable.RestorationFirst,
 * upstream stacked review https://github.com/jfairfaxball-348/engame-chess/pull/6.
 * Its proofs extract the first two branches of the frozen
 * KRKCentral.restoration_bound argument. This is NOT a root-to-mate policy.
 *
 * The original board, history and halfmove clock are retained. No search,
 * heuristic, tablebase, engines or first-legal fallback are used.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare} from './krk-local-witness.js';

export const KRK_RESTORATION_LEMMAS=Object.freeze({
  far:'EndgameChess.Rules.KRKExecutable.restorationFar_sound',
  king:'EndgameChess.Rules.KRKExecutable.restorationKing_sound'
});
export const KRK_RESTORATION_REVIEW='https://github.com/jfairfaxball-348/engame-chess/pull/6';

function framed(s,f){
  if(!KRK_FRAMES.includes(f)||s?.material!=='krk'||
    !Array.isArray(s.board)||!Array.isArray(s.history)||
    !Number.isInteger(s.halfmove)||s.halfmove<0)return null;
  const b=s.board,rook=b.find(p=>p?.[1]==='R');
  if(!rook||s.turn!==rook[0]||validateSetup(b,'krk',s.turn)!==null||
    outcome(b,s.turn,s.history,s.halfmove).kind!=='ongoing')return null;
  const strong=s.turn,weak=opposite(strong);
  const sk=findKing(b,strong),rs=b.indexOf(rook),wk=findKing(b,weak);
  if(sk<0||rs<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,f));
  const [rx,ry]=coords(krkTransformSquare(rs,f));
  const [wx,wy]=coords(krkTransformSquare(wk,f));
  // The exact restoration input: king two ranks under the rook,
  // weak king above the rook; strong king on an interior file.
  if(sy+2!==ry||ry>=wy||sx<1||sx>6)return null;
  return {b,strong,weak,sk,rs,wk,sx,sy,rx,ry,wx,wy,frame:f};
}

export function krkRestorationFirstChoice(state,frame='id'){
  const p=framed(state,frame);if(!p)return null;
  const {b,strong,sk,rs,sx,sy,rx,ry,wx,frame:f}=p;
  const margin=Math.abs(rx-wx),ruleKey=margin<3?'far':'king';
  // These are EXACTLY the Lean-defined coordinates, in a chosen involution.
  const destination=ruleKey==='far'?
    squareAt(wx>=4?0:7,ry):
    squareAt(sx<3?sx+1:sx>4?sx-1:sx,sy+1);
  const source=ruleKey==='far'?rs:sk;
  const from=source; // already in the original, untransformed board
  const to=krkTransformSquare(destination,f);
  const move=legalMoves(b,strong).find(m=>m.from===from&&m.to===to);
  if(!move)return null;
  return Object.freeze({
    kind:'step',phase:ruleKey==='far'?'restoration-rook-rescue':'restoration-king-catch-up',
    move,frame:f,ruleKey,rule:KRK_RESTORATION_LEMMAS[ruleKey],
    proofReview:KRK_RESTORATION_REVIEW,proofStatus:'upstream-draft-pending-merge',
    premises:'K.y + 2 = R.y < k.y; 1 <= K.x <= 6; rook file margin '+(ruleKey==='far'?'<3':'>=3'),
    postcondition:ruleKey==='far'?
      'After every legal weak reply, the rook file margin is at least three.':
      'After every legal weak reply, the wall remains, rook file margin is at least two, and the king lies in files 2..5.',
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/** Independent all-LEGAL-reply falsification, not a global Lean/JS equivalence proof. */
export function auditKRKRestorationFirst(state,frame='id'){
  const p=framed(state,frame),choice=krkRestorationFirstChoice(state,frame);
  if(!p||!choice)return {ok:false,replies:0};
  const after=play(state,choice.move);
  const replies=legalMoves(after.board,p.weak);
  if(!replies.length)return {ok:false,replies:0};
  for(const reply of replies){
    if(reply.capture||reply.piece!==p.weak+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const defended=play(after,reply),b=defended.board;
    const sk=findKing(b,p.strong),rs=b.indexOf(p.strong+'R');
    const wk=findKing(b,p.weak);
    if(sk<0||rs<0||wk<0)
      return {ok:false,replies:replies.length,failedReply:reply};
    const [sx,sy]=coords(krkTransformSquare(sk,frame));
    const [rx,ry]=coords(krkTransformSquare(rs,frame));
    const [wx,wy]=coords(krkTransformSquare(wk,frame));
    const good=sy<ry&&ry<wy&&
      (choice.ruleKey==='far'?Math.abs(rx-wx)>=3:
        Math.abs(rx-wx)>=2&&sx>=2&&sx<=5);
    if(!good)return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,phase:choice.phase,replies:replies.length,
    isCompleteWinningPolicy:false,maxMatePlies:null};
}

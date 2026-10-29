/**
 * KRK06 (draft): explicit first action on a CENTRAL CLOSE WALL.
 *
 * The new aligned/rook-margin-deficient rescue is extracted exactly from
 * KRKExecutable.centralAlignedRescue_sound, on the isolated upstream
 * krk06-central-aligned-rescue branch. This is one quantified pair, not a
 * winning policy; other central cases delegate only to pre-existing source
 * steps, with an explicit handoff where the proof is not executable.
 *
 * No chess engine, tablebase, search or guessed "first legal" move.
 */
import {
  coords,findKing,legalMoves,opposite,outcome,play,positionKey,
  squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,krkTransformSquare}
  from './krk-local-witness.js';
import {krkReadyDispatch}
  from './krk-ready-dispatch.js';

export const KRK_CENTRAL_ALIGNED_RULE =
  'EndgameChess.Rules.KRKExecutable.centralAlignedRescue_sound';
export const KRK_CENTRAL_BACK_RULE =
  'EndgameChess.Rules.KRKExecutable.centralBackRook_sound';
export const KRK_CENTRAL_BACK_SOURCE =
  'https://github.com/jfairfaxball-348/engame-chess/blob/3991ab34a9e4fc747529ef6edc5f58f53372b72e/formal/EndgameChess/Rules/KRKExecutable/CentralBackRook.lean';
export const KRK_CENTRAL_ALIGNED_SOURCE =
  'https://github.com/jfairfaxball-348/engame-chess/blob/9b344f1fe341e62e0f3fca9920832b202a2144b7/formal/EndgameChess/Rules/KRKExecutable/CentralAlignedRescue.lean';

function frameOf(state,frame){
  if(!KRK_FRAMES.includes(frame)||state?.material!=='krk'||
    !Array.isArray(state.board)||state.board.length!==64||
    !Array.isArray(state.history)||!Array.isArray(state.log)||
    !Number.isInteger(state.halfmove)||state.halfmove<0||
    state.history.at(-1)!==positionKey(state.board,state.turn)||
    outcome(state.board,state.turn,state.history,state.halfmove).kind!=='ongoing')
    return null;
  const rook=state.board.find(p=>p?.[1]==='R');
  if(!rook||state.turn!==rook[0]||
    validateSetup(state.board,'krk',state.turn)!==null)return null;
  const sk=findKing(state.board,state.turn);
  const rs=state.board.indexOf(rook),wk=findKing(state.board,opposite(state.turn));
  if(sk<0||rs<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rs,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  if(![3,4].includes(sx)||sy+1!==ry||ry>=wy)return null;
  return {sk,rs,wk,sx,sy,rx,ry,wx,wy,margin:Math.abs(rx-wx)};
}

function handoff(frame,reason){
  return Object.freeze({
    kind:'handoff',phase:'central-unextracted',frame,reason,move:null,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/** Unique coordinate of the aligned-rescue constructor; no fallback. */
export function krkCentralAlignedRescueChoice(state,frame='id'){
  const g=frameOf(state,frame);
  if(!g||g.sx!==g.wx||g.margin>=2)return null;
  // This proof is clock-free. Do not treat its move as FIDE-forcing when a
  // defender could claim 50 moves or repeated positions.
  const key=positionKey(state.board,state.turn);
  if(state.halfmove>=98||
      state.history.filter(k=>k===key).length>=3)return null;
  const destination=krkTransformSquare(
    squareAt(g.wx>=4?0:7,g.ry),frame
  );
  const move=legalMoves(state.board,state.turn).find(
    m=>m.from===g.rs&&m.to===destination
  );
  if(!move)return null;
  return Object.freeze({
    kind:'step',phase:'central-aligned-rook-rescue',frame,move,
    rule:KRK_CENTRAL_ALIGNED_RULE,
    proofSource:KRK_CENTRAL_ALIGNED_SOURCE,
    proofStatus:'upstream-draft-awaiting-exact-head-CI',
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/**
 * Exact oriented back-rook first move from positive_bound's fallback.
 * The direction is determined by the weak king's side of the strong king,
 * not by a heuristic score. The Lean theorem covers every weak response.
 */
export function krkCentralBackRookChoice(state,frame='id'){
  const g=frameOf(state,frame);
  if(!g||g.sx===g.wx||g.margin>=2)return null;
  const key=positionKey(state.board,state.turn);
  if(state.halfmove>=98||
      state.history.filter(k=>k===key).length>=3)return null;
  const forward=g.wx>g.sx;
  const targetFile=forward?(g.rx===0?1:0):(g.rx===7?6:7);
  const destination=krkTransformSquare(squareAt(targetFile,g.ry),frame);
  const move=legalMoves(state.board,state.turn).find(
    m=>m.from===g.rs&&m.to===destination
  );
  if(!move)return null;
  return Object.freeze({
    kind:'step',phase:'central-oriented-back-rook',frame,move,
    orientation:forward?'positive-x':'negative-x',
    rule:KRK_CENTRAL_BACK_RULE,proofSource:KRK_CENTRAL_BACK_SOURCE,
    proofStatus:'upstream-draft-awaiting-exact-head-CI',
    inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/**
 * A central-wall first-action selector, not a global policy. It joins
 * the first aligned rescue to already extracted READY steps. A missing
 * central case is an explicit handoff, NEVER an arbitrary move.
 */
export function krkCentralBoundaryNext(state,frame='id'){
  const g=frameOf(state,frame);
  if(!g)return null;
  if(g.margin<2){
    const local=g.sx===g.wx?
      krkCentralAlignedRescueChoice(state,frame):
      krkCentralBackRookChoice(state,frame);
    return local ||
      handoff(frame,'Proof action unavailable or history/clock forbids certification');
  }
  if(g.margin>=2){
    const ready=krkReadyDispatch(state,frame);
    if(ready?.kind==='step')return Object.freeze({
      ...ready,fromCentralBoundary:true,
      isCompleteWinningPolicy:false,maxMatePlies:null
    });
    return handoff(frame,'READY branch not composed into a total mate policy');
  }
  return handoff(frame,'Unaligned central wall with rook margin <2: explicit back-rook branch not yet extracted');
}

/** Independent falsification over EVERY legal weak reply to the new move. */
export function auditKRKCentralAlignedRescue(state,frame='id'){
  const witness=krkCentralAlignedRescueChoice(state,frame),g=frameOf(state,frame);
  if(!witness||!g)return {
    ok:false,replies:0,isCompleteWinningPolicy:false,maxMatePlies:null
  };
  const after=play(state,witness.move);
  const replies=legalMoves(after.board,after.turn);
  if(!replies.length)return {
    ok:false,replies:0,isCompleteWinningPolicy:false,maxMatePlies:null
  };
  for(const reply of replies){
    if(reply.capture||reply.piece!==opposite(state.turn)+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const child=play(after,reply);
    const sk=findKing(child.board,state.turn),rs=child.board.indexOf(state.turn+'R'),
      wk=findKing(child.board,opposite(state.turn));
    if(sk<0||rs<0||wk<0)return {
      ok:false,replies:replies.length,failedReply:reply
    };
    const [sx,sy]=coords(krkTransformSquare(sk,frame));
    const [rx,ry]=coords(krkTransformSquare(rs,frame));
    const [,wy]=coords(krkTransformSquare(wk,frame));
    const [wx]=coords(krkTransformSquare(wk,frame));
    if(![3,4].includes(sx)||sy+1!==ry||ry>=wy||
       Math.abs(rx-wx)<3){
      return {ok:false,replies:replies.length,failedReply:reply};
    }
  }
  return {ok:true,replies:replies.length,
    terminal:'central-wall successor, not mate',
    isCompleteWinningPolicy:false,maxMatePlies:null};
}

/** Independent complete weak-reply audit for the oriented rook fallback. */
export function auditKRKCentralBackRook(state,frame='id'){
  const witness=krkCentralBackRookChoice(state,frame),g=frameOf(state,frame);
  if(!witness||!g)return {
    ok:false,replies:0,isCompleteWinningPolicy:false,maxMatePlies:null
  };
  const after=play(state,witness.move);
  const replies=legalMoves(after.board,after.turn);
  if(!replies.length)return {ok:false,replies:0};
  for(const reply of replies){
    if(reply.capture||reply.piece!==opposite(state.turn)+'K')
      return {ok:false,replies:replies.length,failedReply:reply};
    const child=play(after,reply);
    const sk=findKing(child.board,state.turn),rs=child.board.indexOf(state.turn+'R'),
      wk=findKing(child.board,opposite(state.turn));
    if(sk<0||rs<0||wk<0)
      return {ok:false,replies:replies.length,failedReply:reply};
    const [,sy]=coords(krkTransformSquare(sk,frame));
    const [rx,ry]=coords(krkTransformSquare(rs,frame));
    const [wx,wy]=coords(krkTransformSquare(wk,frame));
    if(sy+1!==ry||ry>=wy||Math.abs(rx-wx)<2)
      return {ok:false,replies:replies.length,failedReply:reply};
  }
  return {ok:true,replies:replies.length,
    terminal:'oriented central-wall successor, not mate',
    isCompleteWinningPolicy:false,maxMatePlies:null};
}

/**
 * Experimental, explicitly PARTIAL KQK constructive controller.
 *
 * This is an independent literal translation of named geometric transitions
 * from the frozen KQK proof, NOT an extraction of the classical winning choice.
 *
 * References (upstream proof-source SHA c72365a8ba46f59114a2a77d9d38993f6a52df80):
 *   Rules/KQK/{Edge,EdgeForce,ShadowGeometry,ShadowForce,ShadowExit,
 *               FramedFinish,Symmetry,BandEntry,BandProgress,BandForce,\n *               BandRaise,BandFrames,KnightPrison,RankFive}.lean
 *
 * No engine, tablebase, minimax, search tree, per-position move atlas or
 * "first legal" fallback. Out-of-domain positions deliberately return null.
 */
import {
  coords, squareAt, findKing, distance, legalMoves, opposite
} from './chess.js';

export const KQK_PROOF_SOURCE_SHA = 'c72365a8ba46f59114a2a77d9d38993f6a52df80';

// The exact eight chessboard isometries used in KQK.FramedFinish/Symmetry.
const FRAMES = Object.freeze({
  id: ([x,y]) => [x,y],
  reflectX: ([x,y]) => [7-x,y],
  reflectY: ([x,y]) => [x,7-y],
  rotate180: ([x,y]) => [7-x,7-y],
  swap: ([x,y]) => [y,x],
  anti: ([x,y]) => [7-y,7-x],
  rotate90: ([x,y]) => [7-y,x],
  rotate270: ([x,y]) => [y,7-x]
});
const INV = Object.freeze({
  id:'id',reflectX:'reflectX',reflectY:'reflectY',
  rotate180:'rotate180',swap:'swap',anti:'anti',
  rotate90:'rotate270',rotate270:'rotate90'
});
export const KQK_FRAMES = Object.freeze(Object.keys(FRAMES));
const image = (frame,sq) => FRAMES[frame](coords(sq));
const preimage = (frame,x,y) => {
  const [a,b] = FRAMES[INV[frame]]([x,y]);
  return squareAt(a,b);
};
const targetMove = (state,strong,from,to,sourcePhase) => {
  const move=legalMoves(state.board,strong).find(m=>m.from===from&&m.to===to);
  return move?{move,sourcePhase,rule:sourcePhase,continuationPhase:null}:null;
};
const geometric = (state,strong,frame) => {
  const board=state.board,queen=board.indexOf(strong+'Q'),
    sk=findKing(board,strong),wk=findKing(board,opposite(strong));
  if(queen<0||sk<0||wk<0)return null;
  return {queen,sk,wk,k:image(frame,sk),q:image(frame,queen),w:image(frame,wk)};
};
const shadow = g => {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  return kx+ky<=4 && wx+wy>=8 && qx+1===wx && qy+2===wy && wx<=6;
};
const edge = g => {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  return ky<=5 && qy===6 && wy===7 && qx<=4 && qx+2<=wx;
};
const toward = (a,b) => a<b?a+1:a>b?a-1:a;
const makeToken = (state,strong,frame,kind) => ({
  kind,frame,strong,
  // The token is bound to the exact post-move queen/king/weak board and
  // move-count. It is only valid after ONE actual legal lone-king reply.
  queen:state.board.indexOf(strong+'Q'),
  king:findKing(state.board,strong),
  weak:findKing(state.board,opposite(strong)),
  moveCount:state.log.length
});
const tagged = (choice,token) => choice?{...choice,continuationPhase:token}:null;

/** Exact source-defined EdgeWall sequence, including the two-file corridor.
 * EdgeForce.edge_wall_bound: front_setup -> corner_prison_bound -> mate.
 */
function edgeChoice(state,strong,frame,g) {
  const [kx,ky]=g.k,[qx]=g.q,[wx]=g.w;
  let to,from,sourcePhase;
  if(wx>=6) {
    if(qx!==4) {
      from=g.queen;to=preimage(frame,4,6);
      sourcePhase='KQK.EdgeForce.shift_queen_to_corner_prison';
    } else if(kx!==6||ky!==5) {
      from=g.sk;to=preimage(frame,toward(kx,6),toward(ky,5));
      sourcePhase='KQK.Edge.corner_prison_bound.towardSquare';
    } else {
      from=g.queen;to=preimage(frame,wx,6);
      sourcePhase='KQK.Edge.corner_prison_bound.protected_mate';
    }
  } else if(qx+2<wx) {
    from=g.queen;to=preimage(frame,wx-2,6);
    sourcePhase='KQK.EdgeForce.front_setup.shift_queen';
  } else {
    from=g.sk;to=preimage(frame,kx,ky===0?1:ky-1);
    sourcePhase='KQK.EdgeForce.front_setup.king_tempo';
  }
  return targetMove(state,strong,from,to,sourcePhase);
}

/** ShadowForce.shadow_strong_bound: enter the knight-shadow region with
 * the deterministic harmless king tempo explicitly constructed in Lean.
 */
function shadowStart(state,strong,frame,g) {
  const [kx,ky]=g.k;
  const [nx,ny]=kx>0?[kx-1,ky]:ky>0?[kx,ky-1]:[1,0];
  const choice=targetMove(state,strong,g.sk,preimage(frame,nx,ny),
    'KQK.ShadowForce.shadow_strong_bound.king_tempo');
  if(!choice)return null;
  const post={...state,board:state.board.slice(),log:state.log.concat('shadow-start')};
  post.board[choice.move.to]=post.board[choice.move.from];
  post.board[choice.move.from]=null;
  return tagged(choice,makeToken(post,strong,frame,'shadow-reply'));
}

/** After an actual legal weak reply, ShadowForce either copies the new
 * knight offset (a one-square queen move), or calls ShadowExit's explicit
 * boundary construction. No other action is substituted.
 */
function shadowReply(state,strong,token) {
  const {frame}=token;
  const g=geometric(state,strong,frame);
  if(!g)return null;
  const [wx,wy]=g.w;
  if(wx===7) {
    const [qx,qy]=g.q;
    if(qx!==5||!(qy+1===wy||qy+3===wy))return null;
    let x,y,phase,nextKind=null;
    if(wy===1) {
      if(qy!==0)return null;
      [x,y]=[5,2];nextKind='shadow-bottom-reply';
      phase='KQK.ShadowExit.bottom_check_preparation';
    } else if(wy===7&&qy===6) {
      [x,y]=[4,6];phase='KQK.ShadowExit.top_prison';
    } else if(wy===7&&qy===4) {
      [x,y]=[6,4];phase='KQK.ShadowExit.top_swap_wall';
    } else if(wy>=2&&wy<=6) {
      [x,y]=[6,wy-2];phase='KQK.ShadowExit.swap_edge_wall';
    } else return null;
    const choice=targetMove(state,strong,g.queen,preimage(frame,x,y),phase);
    if(!choice)return null;
    if(nextKind) {
      const post={...state,board:state.board.slice(),log:state.log.concat('shadow-exit')};
      post.board[choice.move.to]=post.board[choice.move.from];
      post.board[choice.move.from]=null;
      return tagged(choice,makeToken(post,strong,frame,nextKind));
    }
    return choice;
  }
  if(wx<=0||wx>6||wy<2)return null;
  const to=preimage(frame,wx-1,wy-2);
  const choice=targetMove(state,strong,g.queen,to,
    'KQK.ShadowForce.shadow_weak_bound.copy_weak_step');
  if(!choice)return null;
  const post={...state,board:state.board.slice(),log:state.log.concat('shadow-copy')};
  post.board[choice.move.to]=post.board[choice.move.from];
  post.board[choice.move.from]=null;
  return tagged(choice,makeToken(post,strong,frame,'shadow-reply'));
}
function bottomReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  // ShadowExit: the legal weak reply is forced to (6,0), then Q(4,1).
  if(!g || g.w[0]!==6 || g.w[1]!==0 || g.q[0]!==5||g.q[1]!==2)return null;
  return targetMove(state,strong,g.queen,preimage(token.frame,4,1),
    'KQK.ShadowExit.bottom_to_reflected_prison');
}

/**
 * Separating-rank progression from the frozen BandEntry/BandProgress/BandForce
 * proofs. We only translate the explicit choices under their stated geometric
 * hypotheses. The fixed-wall preparation measure is
 *   qy - 1 - ky + |kx - qx|;
 * the prepared measure is
 *   2(7-kx) + 2(7-qx) + 4(5-qy).
 * Every pair below decreases its applicable measure, or enters the named
 * knight-prison/edge-wall finish. No minimax or arbitrary legal-move fallback.
 */
function bandChoice(state,strong,frame,g) {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  if (!(ky<qy && qy<wy && qx<wx)) return null;
  const choice=(from,x,y,phase,continuation=null)=>{
    const result=targetMove(state,strong,from,preimage(frame,x,y),phase);
    if(!result||!continuation)return result;
    const post={...state,board:state.board.slice(),log:state.log.concat('band-cross')};
    post.board[result.move.to]=post.board[result.move.from];
    post.board[result.move.from]=null;
    return tagged(result,makeToken(post,strong,frame,continuation));
  };
  // BandEntry.wall_ninety_one: last-rank wall at file five is widened.
  if(qy===6 && qx===5 && wx===7 && wy===7)
    return choice(g.queen,4,6,'KQK.BandEntry.wall_ninety_one.six_file_fix');
  if(qy>5)return null;
  // RankFive.corner_knight_rescue: handle (6,5),(7,7) BEFORE
  // any king advance, avoiding a stalemate.
  if(qy===5&&qx===6&&wx===7&&wy===7)
    return kx===5&&ky===5
      ? choice(g.queen,7,5,'KQK.SetupCorners.king_blocks_target_bound')
      : choice(g.queen,5,5,'KQK.KnightPrison.corner_knight_rescue');
  if(qx>5)return null;
  // BandEntry.wall_prepare_bound: approach the queen rank, then file.
  if(ky+1<qy)
    return choice(g.sk,kx,ky+1,'KQK.BandEntry.wall_prepare_bound.vertical');
  if(ky+1!==qy)return null;
  if(kx!==qx)
    return choice(g.sk,toward(kx,qx),ky,
      'KQK.BandEntry.wall_prepare_bound.horizontal');
  // Prepared sk qs wk: same king/queen file, king one rank below.
  if(qy===5&&wx===7&&wy===7&&qx!==5)
    return choice(g.queen,5,5,'KQK.RankFive.rank_five_corner_bound');
  if(kx+2<=wx)
    return choice(g.sk,kx+1,ky,'KQK.BandProgress.prepared_king_step');
  if(qx+2<=wx)
    return choice(g.queen,wx-1,qy,'KQK.BandProgress.prepared_queen_step');
  if(qx+1!==wx)return null;
  if(qy===5&&wy===7) {
    if(wx>=2&&wx<=6)
      return choice(g.queen,wx-2,6,'KQK.RankFive.rank_five_knight_bound');
    if(wx===1)
      return choice(g.queen,1,5,'KQK.RankFive.left_knight_rescue');
    // wx=7 is treated by the earlier rank-five corner branch.
    return null;
  }
  if(qy<=4 && qy+2<=wy)
    return choice(g.sk,wx,qy,'KQK.BandRaise.king_cross','band-raise');
  return null;
}
/** KnightBox/KnightPrison: the boundary response is defined directly in Lean,
 * including the left-reflected corner and the corner-blocking king exception.
 */
function knightChoice(state,strong,frame,g) {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  if(qy!==5||ky>5)return null;
  const step=(from,x,y,phase,token=null)=>{
    const result=targetMove(state,strong,from,preimage(frame,x,y),phase);
    if(!result||!token)return result;
    const post={...state,board:state.board.slice(),log:state.log.concat('knight-phase')};
    post.board[result.move.to]=post.board[result.move.from];
    post.board[result.move.from]=null;
    return tagged(result,makeToken(post,strong,frame,token));
  };
  if(qx===5) {
    if(wx===6&&wy===7)
      return step(g.queen,4,6,'KQK.KnightPrison.knight_top_bound');
    if(wx===7&&wy===6)
      return ky<=4
        ? step(g.sk,kx===7?6:kx+1,ky,
          'KQK.KnightPrison.knight_prison_bound.king_tempo','knight-side')
        : step(g.sk,kx,4,'KQK.KnightPrison.knight_prison_low_five_bound',
          'knight-side');
    return null;
  }
  if(qx===1&&wx===0&&wy===7)
    return step(g.queen,2,5,'KQK.RankFive.left_corner_bound');
  if(qx===1&&wx===2&&wy===7)
    return step(g.queen,0,6,'KQK.RankFive.left_fork_weak_bound.edge_entry');
  if(qx===7&&wx===6&&wy===7)
    return step(g.queen,6,6,'KQK.SetupCorners.king_blocks_target_bound.finish');
  return null;
}
/** The next two forced source steps have strict one-reply tokens, just
 * like the frozen ShadowForce copier; no generic move can replace them. */
function bandRaiseReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g)return null;
  const [qx,qy]=g.q,[kx,ky]=g.k,[wx,wy]=g.w;
  if(ky!==qy||kx<qx+1||qy>4||wy<qy+2||wx<kx)return null;
  return targetMove(state,strong,g.queen,preimage(token.frame,qx,qy+1),
    'KQK.BandRaise.prepared_raise_bound.queen_rise');
}
function knightSideReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g||g.q[0]!==5||g.q[1]!==5||g.w[0]!==6||g.w[1]!==7||
      g.k[1]>4)return null;
  return targetMove(state,strong,g.queen,preimage(token.frame,4,6),
    'KQK.KnightPrison.knight_prison_bound.top_reply');
}

function validToken(state,strong,token) {
  if(!token||typeof token!=='object'||!['shadow-reply','shadow-bottom-reply','band-raise','knight-side'].includes(token.kind)||
     !Object.hasOwn(FRAMES,token.frame)||token.strong!==strong||
     state.log.length!==token.moveCount+1)return false;
  const weak=findKing(state.board,opposite(strong));
  return state.board[token.queen]===strong+'Q'&&
    state.board[token.king]===strong+'K'&&
    weak!==token.weak&&distance(weak,token.weak)===1;
}

/** Only called for the queen-side player's turn. */
export function kqkSourceChoice(state,strong,token=null) {
  if(!state||state.material!=='kqk'||state.turn!==strong||
     !state.board.includes(strong+'Q')||state.board.includes(opposite(strong)+'Q'))return null;
  if(token!==null) {
    if(!validToken(state,strong,token))return null;
    if(token.kind==='shadow-reply')return shadowReply(state,strong,token);
    if(token.kind==='shadow-bottom-reply')return bottomReply(state,strong,token);
    if(token.kind==='band-raise')return bandRaiseReply(state,strong,token);
    return knightSideReply(state,strong,token);
  }
  // Frame priority is a deterministic choice of PROVEN symmetry, not a
  // ranking of arbitrary legal moves. Every chosen move has a source tag.
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    if(edge(g)){
      const choice=edgeChoice(state,strong,frame,g);
      if(choice)return {...choice,frame};
    }
  }
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    const choice=knightChoice(state,strong,frame,g);
    if(choice)return {...choice,frame};
  }
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    const choice=bandChoice(state,strong,frame,g);
    if(choice)return {...choice,frame};
  }
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    if(shadow(g)){
      const choice=shadowStart(state,strong,frame,g);
      if(choice)return {...choice,frame};
    }
  }
  return null;
}

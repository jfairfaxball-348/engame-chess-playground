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
  if(!move)return null;
  // Safety contract shared by the frozen KQK constructions: a purported
  // winning action must not hand the queen to an immediate legal KxQ.
  // This is a rejection-only proof-translation guard, NEVER a substitute
  // selector or ranked alternative to the source-defined action.
  const after=state.board.slice();
  after[to]=after[from];after[from]=null;
  if(legalMoves(after,opposite(strong)).some(r=>r.capture===strong+'Q'))
    return null;
  return {move,sourcePhase,rule:sourcePhase,continuationPhase:null};
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
  // Files six and seven remain legal below rank five (OpenBand). Only the
  // rank-five corner exception is excluded by the top-band premise.
  if(qy===5&&qx>5)return null;
  // BandEntry.wall_prepare_bound: approach the queen rank, then file.
  if(ky+1<qy)
    return choice(g.sk,kx,ky+1,'KQK.BandEntry.wall_prepare_bound.vertical');
  if(ky+1!==qy)return null;
  if(kx<qx||kx>wx)
    return choice(g.sk,toward(kx,qx),ky,
      'KQK.BandEntry.wall_prepare_bound.horizontal');
  // Prepared sk qs wk: same king/queen file, king one rank below.
  if(qy===5&&wx===7&&wy===7&&qx!==5)
    return choice(g.queen,5,5,'KQK.RankFive.rank_five_corner_bound');
  if(kx+2<=wx)
    return choice(g.sk,kx+1,ky,'KQK.BandProgress.prepared_king_step','band-prepared');
  if(qx+2<=wx)
    return choice(g.queen,wx-1,qy,'KQK.BandProgress.prepared_queen_step','band-prepared');
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
  // SetupCorners.corner_knight_low_five_rescue: exactly the (6,5) queen
  // and (7,7) weak king.  The source splits on whether K(5,5) blocks
  // its ordinary Q(5,5) preparation. In the blocked case the proved
  // king_blocks_target_bound instead plays Q(7,5), forcing ...K(6,7)
  // followed by Q(6,6) mate. Both follow-on moves are already covered
  // below by KnightPrison and king_blocks_target_bound.finish.
  // Do not generalise this to arbitrary fifth-rank knight positions.
  if(qx===6&&wx===7&&wy===7) {
    if(kx===5&&ky===5)
      return step(g.queen,7,5,
        'KQK.SetupCorners.king_blocks_target_bound.queen_to_seven');
    return step(g.queen,5,5,
      'KQK.SetupCorners.corner_knight_low_five_rescue.queen_to_five');
  }
  if(qx===5) {
    if(wx===6&&wy===7)
      return ky===5
        ? step(g.sk,kx,4,
          'KQK.KnightPrison.knight_prison_low_five_bound.king_down','knight-low-five')
        : step(g.queen,4,6,'KQK.KnightPrison.knight_top_bound');
    if(wx===7&&wy===6)
      return ky<=4
        ? step(g.sk,kx===7?6:kx+1,ky,
          'KQK.KnightPrison.knight_prison_bound.king_tempo','knight-side')
        : step(g.sk,kx,4,
          'KQK.KnightPrison.knight_prison_low_five_bound.king_down','knight-low-five');
    return null;
  }
  // RankFive.left_corner_bound and left_fork_weak_bound both require
  // sk.rank <= 4. At rank five use SetupCorners.low_five instead;
  // a reflected matching pattern is not a licence to drop 'low'.
  if(ky<=4&&qx===1&&wx===0&&wy===7)
    return step(g.queen,2,5,'KQK.RankFive.left_corner_bound');
  if(ky<=4&&qx===1&&wx===2&&wy===7)
    return step(g.queen,0,6,'KQK.RankFive.left_fork_weak_bound.edge_entry');
  // SetupCorners.king_blocks_target_bound: the last Q(6,6) is
  // protected ONLY by the strong king at (5,5). Without both king
  // coordinates this apparent mate simply hangs the queen to KxQ.
  if(qx===7&&wx===6&&wy===7&&kx===5&&ky===5)
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
  // BandRaise.prepared_raise_bound explicitly diverts the rank-four
  // top-right corner into KnightBox. Q(qx,5) here is a stalemate.
  if(qy===4&&kx===7)
    return targetMove(state,strong,g.queen,preimage(token.frame,5,5),
      'KQK.BandRaise.prepared_raise_bound.corner_knight_box');
  return targetMove(state,strong,g.queen,preimage(token.frame,qx,qy+1),
    'KQK.BandRaise.prepared_raise_bound.queen_rise');
}
// KnightPrison.knight_prison_low_five_bound must lower a rank-five
// strong king BEFORE using the low-king knight-prison constructions.
// The weak king may enter either knight square after that legal step;
// dispatch only those two proved branches in the original frame.
function knightLowFiveReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g||g.k[1]!==4||g.q[0]!==5||g.q[1]!==5||
     !((g.w[0]===6&&g.w[1]===7)||(g.w[0]===7&&g.w[1]===6)))return null;
  return knightChoice(state,strong,token.frame,g);
}

function knightSideReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g||g.q[0]!==5||g.q[1]!==5||g.w[0]!==6||g.w[1]!==7||
      g.k[1]>4)return null;
  return targetMove(state,strong,g.queen,preimage(token.frame,4,6),
    'KQK.KnightPrison.knight_prison_bound.top_reply');
}


/**
 * S027: the frozen BandProgress.prepared_{king,queen}_step theorems
 * preserve Prepared under EVERY legal weak reply, in the SAME source
 * orientation. Do not discard that all-reply continuation and reselect
 * an unrelated frame. Recheck the exact Prepared coordinates before
 * taking another source-defined band action; otherwise fail closed.
 */
function bandPreparedReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g)return null;
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  // Prepared: Wall (king below queen below weak, queen left of weak),
  // queen rank <=5, king one rank below queen, queen <= king <= weak.
  if(qy>5||ky+1!==qy||qy>=wy||qx>=wx||qx>kx||kx>wx)
    return null;
  return bandChoice(state,strong,token.frame,g);
}

/**
 * S020: explicit strong-entry branches from frozen SameRankEntry,
 * FarFilePreparation, OrientedEntry and TightEntry (EC-T0050).
 *
 * Each candidate retains the source's coordinate premises. A legal move
 * alone does not license a branch; if its geometric premises fail, this
 * partial policy deliberately refuses that branch. No move search.
 */
function protectedFileChoice(state,strong,frame,g) {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  if(qx>1||qx===kx+1||wx<2||qy!==ky+1||qy<2||
     wy>ky||ky>wy+1||Math.abs(kx-wx)<2)return null;
  if(kx===5&&ky===1&&wx===7&&wy===0)
    return targetMove(state,strong,g.queen,preimage(frame,7,2),
      'KQK.TightEntry.protected_file_entry.corner_mate');
  if(kx+2<=wx)
    return targetMove(state,strong,g.queen,preimage(frame,kx+1,qy),
      'KQK.TightEntry.protected_file_entry.forward_wall');
  if(wx+2<=kx)
    return targetMove(state,strong,g.queen,preimage(frame,kx-1,qy),
      'KQK.TightEntry.protected_file_entry.backward_wall');
  return null;
}
function tightFileReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  return g?protectedFileChoice(state,strong,token.frame,g):null;
}
/**
 * SameRankEntry.backrank_entry's FINAL branch is a two-ply composition:
 * after K(wk.file,0), EVERY legal weak reply enters
 * protected_backrank_entry. The protected Q(q.file,1) must be chosen in
 * the original proof frame, not via a fresh root dispatcher. This is
 * source-defined and does not rank/search moves.
 */
function protectedBackrankReply(state,strong,token) {
  const g=geometric(state,strong,token.frame);
  if(!g)return null;
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  // Exact protected_backrank_entry premises from frozen SameRankEntry:
  // both strong pieces at rank 0, weak rank >= 2, king/queen files
  // adjacent, and weak king not occupying the queen's file. Weak legal
  // reply already supplies its non-check premise.
  if(ky!==0||qy!==0||wy<2||Math.abs(kx-qx)!==1||wx===qx)
    return null;
  return targetMove(state,strong,g.queen,preimage(token.frame,qx,1),
    'KQK.SameRankEntry.protected_backrank_entry.queen_up');
}
function entryChoice(state,strong,frame,g,allowFarFile=true) {
  const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
  const choose=(from,x,y,phase,kind=null)=>{
    const move=targetMove(state,strong,from,preimage(frame,x,y),phase);
    if(!move||!kind)return move;
    const post={...state,board:state.board.slice(),log:state.log.concat('entry-step')};
    post.board[move.move.to]=post.board[move.move.from];
    post.board[move.move.from]=null;
    return tagged(move,makeToken(post,strong,frame,kind));
  };
  // SameRankEntry.positive_right_entry: lower the king one rank to enter
  // Wall, except for the separate closed (6,5) corner theorem.
  if(qy===ky&&wy>=ky+2&&qx<wx&&ky>0 &&
     (qy<=4||(qy===5&&qx<=5)))
    return choose(g.sk,kx,ky-1,
      'KQK.SameRankEntry.positive_right_entry.king_down');
  // SameRankEntry.backrank_entry: when a clear file wall is already
  // present, begin with the source's low-rank wall. The adjacent-king
  // case is the protected_backrank_entry constructed queen step.
  if(qy===0&&ky===0&&wy>=2&&qx!==wx) {
    if(Math.abs(qx-wx)>=2||Math.abs(kx-qx)===1)
      return choose(g.queen,qx,1,
        Math.abs(qx-wx)>=2
          ? 'KQK.SameRankEntry.backrank_entry.clear_low_wall'
          : 'KQK.SameRankEntry.protected_backrank_entry.queen_up');
    // Exact missing final branch of SameRankEntry.backrank_entry:
    // queen adjacent to weak file, king adjacent on the opposite side.
    // The frozen Lean proof moves K to (wk.file, king.rank) and after
    // EVERY weak reply enters protected_backrank_entry. This is a
    // geometric proof action, not a legal-move fallback or search.
    if(Math.abs(qx-wx)===1&&Math.abs(kx-wx)===1&&
       Math.abs(kx-qx)===2)
      return choose(g.sk,wx,ky,
        'KQK.SameRankEntry.backrank_entry.king_to_weak_file',
        'backrank-protected');
  }
  // FarFilePreparation: choose file 0 or 1 from the explicit escape
  // witness, rather than always picking zero (which can stalemate).
  if(allowFarFile&&wy>=ky+2&&wx>=4&&qy!==ky&&qy!==wy&&qx>=2) {
    const escapeX=wx===7?6:wx+1;
    const f=escapeX===Math.abs(qy-wy)?1:0;
    return choose(g.queen,f,qy,
      'KQK.FarFilePreparation.far_file_preparation.escape_preserving','far-file');
  }
  // OrientedEntry.horizontal_far_wall_entry: its high-file narrow
  // branch needs only weak.rank >= king.rank+1, NOT equality.  In
  // particular queen.rank = weak.rank+2 may occur with a larger vertical
  // king/weak gap.  The frozen Lean proof sends Q to file 6 and enters
  // framed EdgeWall (swap for below, reflectX∘swap for above).  Execute
  // this specific source construction BEFORE general clear-wall entry:
  // both lemmas apply in part of this region, but the horizontal proof
  // already supplies the short direct edge-wall transition.
  //
  // Exclude the source's explicit corner-distant mate exception; that
  // is selected before generic entry in kqkSourceChoice.
  if(kx===5&&wx===7&&wy>=ky+1&&
     Math.abs(qy-wy)===2&&qy!==ky&&
     !(ky<qy&&qy<wy)&&qx!==6&&
     !(ky===6&&qy===5&&wy===7))
    return choose(g.queen,6,qy,
      'KQK.OrientedEntry.horizontal_far_wall_entry.narrow_queen_to_six');
  // EntryGeometry.low_right_entry: raise a cleared queen to the rank
  // directly above the king, then the existing Band controller applies.
  if(wy>=ky+2&&ky<=4&&qx+2<=wx&&
     (qx!==kx||ky<qy)&&qy!==ky+1)
    return choose(g.queen,qx,ky+1,
      'KQK.EntryGeometry.clear_low_wall_entry.queen_wall');
  // OrientedEntry.small_file_wall_entry: the exceptional fifth-rank
  // first action enters the already implemented EdgeWall family.
  if(ky===5&&wy===7&&qx<=4&&qx+2<=wx&&
     (qx!==kx||ky<qy)&&qy!==6)
    return choose(g.queen,qx,6,
      'KQK.OrientedEntry.small_file_wall_entry.edge_wall');
  // TightEntry.tight_above_entry / tight_king_step: a one-rank king
  // approach, followed by the source-mandated protected queen file.
  if(qx<=1&&wx>=3&&qy===ky+2&&wy===ky+1&&
     Math.abs(kx-wx)>=2&&qx!==kx+1)
    return choose(g.sk,kx,wy,
      'KQK.TightEntry.tight_king_step.king_approach','tight-file');
  return null;
}

/**
 * FarFileEntry.right_offrank_entry uses FarFilePreparation to make a
 * SINGLE queen transfer to a source-chosen file 0 or 1. After EVERY
 * actual weak reply its proof invokes far_file_stage_bound, which must
 * *not* re-enter far_file_preparation in another reflected frame.
 *
 * The previous global root dispatch could re-prepare a far file from
 * the other side, Q(a7)-Q(h7)-Q(a7), despite a legal weak-king cycle.
 * Keep the original frozen preparation frame in the one-reply token,
 * verify the exact far_file_preparation.all continuation premises,
 * then select a different existing SOURCE-DEFINED entry construction.
 * No new arbitrary move and no search/engine; if no named continuation
 * is translated, fail closed.
 */
function farFileReply(state,strong,token) {
  const original=geometric(state,strong,token.frame);
  if(!original)return null;
  const [kx,ky]=original.k,[qx,qy]=original.q,
    [wx,wy]=original.w;
  if(qx>1||wx<3||wy<ky+1||
     Math.max(Math.abs(kx-wx),Math.abs(ky-wy))<2||
     qy===ky||qy===wy)return null;
  // Any of the eight Lean QueenSym frames may prove the next step;
  // reusing the far-file PREPARATION is forbidden after it has
  // already been discharged by its real weak reply.
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    const [ax,ay]=g.k,[bx,by]=g.q,[cx,cy]=g.w;
    if(ax===5&&ay===6&&by===5&&cx===7&&cy===7&&bx!==7){
      const mate=targetMove(state,strong,g.queen,preimage(frame,7,5),
        'KQK.OrientedEntry.high_file_corner_entry.corner_distant_mate');
      if(mate)return {...mate,frame};
    }
  }
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    if(edge(g)){
      const choice=edgeChoice(state,strong,frame,g);
      if(choice)return {...choice,frame};
    }
  }
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    if(shadow(g)){
      const choice=shadowStart(state,strong,frame,g);
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
    // Existing frozen SameRankEntry, ClearWallEntry, TightEntry and
    // OrientedEntry actions are still available in their proven
    // symmetry frames. No second far-file preparation is allowed.
    const choice=entryChoice(state,strong,frame,g,false);
    if(choice)return {...choice,frame};
  }
  return null;
}

function validToken(state,strong,token) {
  if(!token||typeof token!=='object'||!['shadow-reply','shadow-bottom-reply','band-raise','band-prepared','knight-side','knight-low-five','tight-file','far-file','backrank-protected'].includes(token.kind)||
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
    if(token.kind==='band-prepared')return bandPreparedReply(state,strong,token);
    if(token.kind==='tight-file')return tightFileReply(state,strong,token);
    if(token.kind==='backrank-protected')
      return protectedBackrankReply(state,strong,token);
    if(token.kind==='far-file')return farFileReply(state,strong,token);
    if(token.kind==='knight-low-five')return knightLowFiveReply(state,strong,token);
    return knightSideReply(state,strong,token);
  }
  // Exact OrientedEntry.high_file_corner_entry (frozen Lean source):
  // K(5,6), Q(*,5), weak K(7,7) with non-checking Q on file != 7.
  // The constructive proof moves Q to (7,5) for immediate corner mate.
  // Dispatch before broader overlapping geometries: this is a precise
  // source-premised terminal construction, not a positional preference.
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
    if(kx===5&&ky===6&&qy===5&&wx===7&&wy===7&&qx!==7) {
      const mate=targetMove(state,strong,g.queen,preimage(frame,7,5),
        'KQK.OrientedEntry.high_file_corner_entry.corner_distant_mate');
      if(mate)return {...mate,frame};
    }
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
  // Preserve the existing S018 ShadowForce selection before overlapping
  // newly covered wall regions; shadow replies carry a distinct source token.
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    if(shadow(g)){
      const choice=shadowStart(state,strong,frame,g);
      if(choice)return {...choice,frame};
    }
  }
  // The rank-five sources have more restrictive hypotheses than
  // general knight-prison/reflective corner actions. Dispatch them first
  // whenever ANY proven frame matches. This prevents an earlier reflected
  // frame from accidentally invoking a low-rank lemma at rank five.
  for(const frame of KQK_FRAMES){
    const g=geometric(state,strong,frame);
    const [kx,ky]=g.k,[qx,qy]=g.q,[wx,wy]=g.w;
    if(qx===6&&qy===5&&wx===7&&wy===7&&ky<=5 ||
       qx===5&&qy===5&&ky===5&&
         ((wx===6&&wy===7)||(wx===7&&wy===6))){
      const choice=knightChoice(state,strong,frame,g);
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
    const choice=entryChoice(state,strong,frame,g);
    if(choice)return {...choice,frame};
  }
  return null;
}

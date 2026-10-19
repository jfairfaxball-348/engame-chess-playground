/**
 * Locally reimplemented CONSTRUCTION PATTERNS from immutable EC-T0019
 * (proof-source commit 4acc3e8638a916f329788d4c2b5f0db6f2c9bf67).
 *
 * These are individual legal witness moves, NOT a formally extracted/verified
 * selector for the entire forcing tree. When no pattern applies, caller MUST
 * label the heuristic fallback. No remote import, data file, engine or tablebase.
 */
import { legalMoves, applyMove, outcome, findKing, coords, opposite } from './chess.js';

export const PROOF_SOURCE = Object.freeze({
  theorem: 'EC-T0019',
  commit: '4acc3e8638a916f329788d4c2b5f0db6f2c9bf67',
  url: 'https://github.com/jfairfaxball-348/engame-chess/blob/4acc3e8638a916f329788d4c2b5f0db6f2c9bf67/theorems/frozen/EC-T0019/v1.md'
});

function witness(moves, from, to, rule, reason) {
  const move = moves.find(m => m.from === from && m.to === to);
  return move ? { move, origin: 'proof-pattern', rule, reason } : null;
}
function sq(x,y){ return x>=0 && x<8 && y>=0 && y<8 ? 8*y+x : -1; }
const abs = (a,b) => Math.abs(a-b);
const far = x => x>=4 ? 0 : 7;
const wait = (rookFile,weakFile) => weakFile>=4
  ? (rookFile===0?1:0) : (rookFile===7?6:7);

// Only the four involutive isometries actually used by the frozen setup proof.
// For each frame the defending king is >=2 ranks above the strong king.
function frames(sk,wk){
  const [sx,sy]=coords(sk),[wx,wy]=coords(wk);
  const candidates = [
    {name:'identity',go:([x,y])=>[x,y],back:([x,y])=>[x,y]},
    {name:'rank reflection',go:([x,y])=>[x,7-y],back:([x,y])=>[x,7-y]},
    {name:'axis swap',go:([x,y])=>[y,x],back:([x,y])=>[y,x]},
    {name:'anti-diagonal',go:([x,y])=>[7-y,7-x],back:([x,y])=>[7-y,7-x]}
  ];
  return candidates.filter(g => g.go([wx,wy])[1] - g.go([sx,sy])[1] >= 2);
}

/** Null means this particular turn needs an UNVERIFIED fallback move. */
export function chooseProofPattern(state, computerColor, moves = legalMoves(state.board,state.turn)) {
  if (state.turn !== computerColor || !moves.length) return null;
  if (state.material !== 'krk') {
    const rules = {kk:'EC-T0003',kbk:'EC-T0004',knk:'EC-T0005'};
    if(!rules[state.material]) return null;
    return {move:moves[0],origin:'dead-position-choice',rule:rules[state.material],
      reason:'This is a dead-position class. Any legal move is outcome-equivalent in exploration mode.'};
  }
  const board = state.board, rook = board.findIndex(p=>p?.[1]==='R');
  if (rook<0) return {move:moves[0],origin:'dead-position-choice',rule:'EC-T0003',
    reason:'After the rook was captured only the kings remain; any legal move suffices in exploration mode.'};
  const strong = board[rook][0];
  if(computerColor!==strong){
    const capture=moves.find(m=>m.capture===strong+'R');
    return capture ? {move:capture,origin:'proof-pattern',rule:'EC-T0019 / weak-turn capture obstruction',
      reason:'Capture the unprotected rook. The resulting K vs K position is dead, so the stronger side cannot force mate.'} : null;
  }
  for(const m of moves) {
    const end=outcome(applyMove(board,m),opposite(computerColor));
    if(end.kind==='mate'&&end.winner===computerColor) return {
      move:m,origin:'proof-pattern',rule:'EC-T0008 / actual-mate base case',
      reason:'Deliver legal checkmate immediately; this is the zero-ply terminal case after the move.'};
  }
  const sk=findKing(board,strong), wk=findKing(board,opposite(strong));
  for (const g of frames(sk,wk)) {
    const [sx,sy]=g.go(coords(sk)),[rx,ry]=g.go(coords(rook)),[wx,wy]=g.go(coords(wk));
    const dst = (x,y)=>{const [u,v]=g.back([x,y]);return sq(u,v);};
    const take = (x,y,rule,why)=>witness(moves,rook,dst(x,y),rule+' ('+g.name+')',why);
    const king = (x,y,rule,why)=>witness(moves,sk,dst(x,y),rule+' ('+g.name+')',why);
    const wall = sy<ry && ry<wy;
    if(wall){
      // WallForce.lean: normalise transverse margin by a far-file rook tempo.
      if(abs(rx,wx)<2){
        const p=take(far(wx),ry,'krk_wall_rook_move',
          'Preserve the separating rook wall while moving it to the far file; the cited lemma covers every defending reply.');
        if(p)return p;
      }
      // RankAdvanceRescue.lean: advance one rank; an ensuing rook rescue may be required.
      if(ry+2<=wy && abs(rx,wx)>=2){
        const p=take(rx,ry+1,'krk_rank_advance_rescue',
          'Advance a two-file-margin wall by one rank. The proof permits a subsequent rook-rescue branch.');
        if(p)return p;
      }
      // WallForce.lean: narrow lower band; close the king/rook gap.
      if(wy===ry+1 && ry>=sy+2 && abs(rx,wx)>=2){
        const p=king(sx,sy+1,'krk_rank_wall_force / lower-band catch',
          'Advance the strong king below the separating wall while maintaining its barrier.');
        if(p)return p;
      }
      // WallActions.lean: conditional lateral pursuit in the two-rank lower band.
      if(wy===ry+1 && ry===sy+1 && abs(rx,wx)>=3 && abs(sx,wx)>=2){
        const p=king(sx+Math.sign(wx-sx),sy,'krk_pursuit_king_move',
          'Move the strong king laterally in the direction of the lone king while preserving the rook margin.');
        if(p)return p;
      }
      if(wy===ry+1 && ry===sy+1 && abs(rx,wx)>=2 && abs(sx,wx)===1){
        const p=take(wait(rx,wx),ry,'krk_oriented_lower_pursuit / tempo',
          'Wait on the rook wall to force the lone king to move; the proof requires follow-up case analysis.');
        if(p)return p;
      }
    }
    // SameRankSetup.lean: positive-rank same-rank arrangement starts with king retreat.
    if(ry===sy && sy>0){
      const p=king(sx,sy-1,'krk_same_rank_retreat_force',
        'Retreat the strong king one rank to construct a separating rook wall.');
      if(p)return p;
    }
    // OffRankSetup.lean: if the rook is outside the king interval, first
    // retreat it to the far file when the transverse margin is too small.
    if(ry!==sy && !wall && abs(rx,wx)<2){
      const p=take(far(wx),ry,'krk_offrank_setup_force / far-file preparation',
        'Move the rook to the far file before a proved wall-entry construction.');
      if(p)return p;
    }
    // ClearEntry.lean: a single precise rook move enters a rank wall.
    if(abs(rx,wx)>=2 && (rx!==sx || sy<ry)){
      const p=take(rx,sy+1,'krk_clear_vertical_entry_force',
        'Move the rook to the rank directly above the strong king, making a separating wall.');
      if(p)return p;
    }
    // SameRankSetup.lean: protected back-rank rook entry and preparation.
    if(sy===0 && ry===0 && abs(rx,wx)<2 && abs(sx,wx)<2){
      if(abs(rx,sx)===1){
        const p=take(rx,1,'krk_backrank_protected_force',
          'Raise the adjacent, king-protected rook to establish a rank-one wall.');
        if(p)return p;
      } else {
        const p=king(wx,0,'krk_backrank_setup_force',
          'Align the strong king with the lone king’s file before the protected wall entry.');
        if(p)return p;
      }
    }
  }
  return null;
}

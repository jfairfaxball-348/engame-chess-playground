/**
 * KRK03: READY branch composition for the frozen rook-wall geometry.
 *
 * This is an offline, FAIL-CLOSED source-to-program diagnostic, NOT an
 * adversarial chess-playing policy. Every emitted move is obtained from
 * an already named local Lean extraction; no search, score, tablebase or
 * legal-move fallback chooses a square.
 *
 * Crucial missing pieces: aligned ExitBound, guarded/column continuation,
 * global root dispatcher and all-phase well-founded rank. In particular a
 * successful local audit must not enable KRK gameplay or certify MateWithin.
 */
import {coords,findKing,legalMoves,opposite} from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare}
  from './krk-local-witness.js';
import {krkPrepState} from './krk-prep-controller.js';
import {krkWallClimbChoice,auditKRKWallClimbChoice}
  from './krk-wall-climb.js';
import {krkReadyCutTempoChoice,auditKRKReadyCutTempo}
  from './krk-ready-cut-tempo.js';
import {krkWidePivotChoice,auditKRKWidePivot}
  from './krk-wide-pivot.js';
import {krkGuardedEntryChoice,auditKRKGuardedEntry}
  from './krk-guarded-entry.js';

export const KRK_READY_DISPATCH_SCOPE='local READY and guarded-cut steps only';

function blocked(phase,frame,why){
  return Object.freeze({
    kind:'handoff',phase,frame,reason:why,parent:KRK_PARENT_SHA,
    move:null,isCompleteWinningPolicy:false,maxMatePlies:null
  });
}
function step(phase,witness,frame){
  if(witness?.kind!=='step'||!witness.move)return null;
  return Object.freeze({
    kind:'step',phase,frame,move:witness.move,rule:witness.rule ||
      witness.witness?.rule || witness.ruleKey,
    witness,parent:KRK_PARENT_SHA,
    isCompleteWinningPolicy:false,maxMatePlies:null
  });
}

/**
 * Dispatch ONLY within the exact READY geometry OR a protected guarded cut.
 *
 * Under READY: strong king centrally positioned one rank below the rook;
 * weak king strictly above, and rook/weak file margin >=2. Partition:
 *  - upper band -> already-proved RankTwo move;
 *  - lower band, aligned files -> unextracted ExitBound HANDOFF;
 *  - lower band, wide separation -> protected pivot;
 *  - lower band, narrow unaligned -> certified rook tempo.
 *
 * A cut already protecting a weak king at file distance 1 is not READY,
 * but its independent guardedEntry_sound lemma may give a valid step.
 * Never turn an unavailable source branch into an arbitrary legal move.
 */
export function krkReadyDispatch(state,frame='id'){
  if(!KRK_FRAMES.includes(frame))return null;
  const p=krkPrepState(state,frame);
  if(!p||p.prepDistance!==0)return null;
  const strong=state.turn,weak=opposite(strong),b=state.board;
  const sk=findKing(b,strong),rs=b.indexOf(strong+'R'),wk=findKing(b,weak);
  if(sk<0||rs<0||wk<0)return null;
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rs,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  if(!(sx===3||sx===4)||sy+1!==ry||ry>=wy)return null;

  // A real protected pivot may be READY (margin >=2) or may already have
  // the weak king only one file from the rook (margin debt). Its *separate*
  // guarded lemma has no READY file-margin assumption.
  const guarded=krkGuardedEntryChoice(state,frame);
  if(guarded)return step('guarded-cut',guarded,frame);

  if(!p.ready)return null;
  if(wy>=ry+2){
    const upper=krkWallClimbChoice(state,frame);
    return step('ready-upper',upper,frame) ||
      blocked('ready-upper',frame,'Certified upper-wall action not constructible');
  }
  if(sx===wx){
    return blocked('aligned-exit',frame,
      'Frozen ReadyCut invokes an existential ExitBound; no executable aligned exit is extracted');
  }
  if(Math.abs(sx-wx)>=2){
    const pivot=krkWidePivotChoice(state,frame);
    if(pivot?.kind==='handoff'){
      return blocked('protected-pivot-exit',frame,
        'Protected pivot exists but guarded continuation is not executable here');
    }
    return step('ready-wide-pivot',pivot,frame) ||
      blocked('ready-wide-pivot',frame,'No proved legal cut available in this geometry');
  }
  // Non-alignment with file gap <2 means exactly one file apart.
  const tempo=krkReadyCutTempoChoice(state,frame);
  return step('ready-narrow-tempo',tempo,frame) ||
    blocked('ready-narrow-tempo',frame,'Certified narrow rook tempo cannot be constructed');
}

/** Diagnostic exhausts actual immediate legal replies, never chooses a move. */
export function auditKRKReadyDispatch(state,frame='id'){
  const result=krkReadyDispatch(state,frame);
  if(!result)return {ok:false,reason:'outside READY/guarded domain',replies:0};
  if(result.kind==='handoff')return {
    ok:true,handoff:true,phase:result.phase,replies:0,
    isCompleteWinningPolicy:false
  };
  const permitted=legalMoves(state.board,state.turn).some(m=>
    m.from===result.move.from&&m.to===result.move.to);
  if(!permitted)return {ok:false,reason:'illegal extracted move',replies:0};
  const audits={
    'guarded-cut':auditKRKGuardedEntry,
    'ready-upper':auditKRKWallClimbChoice,
    'ready-wide-pivot':auditKRKWidePivot,
    'ready-narrow-tempo':auditKRKReadyCutTempo
  };
  const local=audits[result.phase]?.(state,frame);
  return {ok:!!local?.ok&&!local?.handoff,phase:result.phase,
    replies:local?.replies??0,local,
    isCompleteWinningPolicy:false,maxMatePlies:null};
}

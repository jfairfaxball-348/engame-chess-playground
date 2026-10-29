/**
 * Exact KRK opposition check and (4-file case) king-up follow-through.
 * Proof: KRKExecutable.OppositionActions, importing frozen
 * KRKForcing.TwoFileCheck + KRKForcing.CheckProgress.
 *
 * These are explicitly scoped, certified moves, NOT a complete opponent.
 * All history, source, and clocks remain attached to the original board.
 */
import {
 applyMove,coords,findKing,legalMoves,opposite,outcome,positionKey,squareAt,validateSetup
} from './chess.js';
import {KRK_FRAMES,KRK_PARENT_SHA,krkTransformSquare}
  from './krk-local-witness.js';

export const KRK_OPPOSITION_LEMMAS=Object.freeze({
  check:'EndgameChess.Rules.KRKExecutable.oppositionCheck_sound',
  follow:'EndgameChess.Rules.KRKExecutable.oppositionFollow_sound'
});
function framed(s,f){
 if(!KRK_FRAMES.includes(f)||s?.material!=='krk'||
   !Array.isArray(s.board)||!Array.isArray(s.history)||
   !Number.isInteger(s.halfmove)||s.halfmove<0)return null;
 const strong=s.turn,rook=s.board.indexOf(strong+'R');
 if(rook<0||validateSetup(s.board,'krk',strong)!==null||
    outcome(s.board,strong,s.history,s.halfmove).kind!=='ongoing')return null;
 const weak=opposite(strong),sk=findKing(s.board,strong),
   wk=findKing(s.board,weak);
 if(sk<0||wk<0)return null;
 const [sx,sy]=coords(krkTransformSquare(sk,f)),
   [rx,ry]=coords(krkTransformSquare(rook,f)),
   [wx,wy]=coords(krkTransformSquare(wk,f));
 return {s,strong,weak,sk,rook,wk,sx,sy,rx,ry,wx,wy};
}

export function krkOppositionCheckChoice(state,frame='id'){
 const p=framed(state,frame);if(!p)return null;
 const {strong,sk,sx,sy,rx,ry,wx,wy,rook}=p;
 if(sx!==wx||wy!==sy+2||Math.abs(rx-wx)<2||ry===wy)return null;
 const target=krkTransformSquare(squareAt(rx,wy),frame);
 const move=legalMoves(state.board,strong).find(m=>m.from===rook&&m.to===target);
 if(!move)return null;
 return Object.freeze({kind:'step',move,frame,
   phase:'OPPOSITION two-file checking rook slide',
   rule:KRK_OPPOSITION_LEMMAS.check,parent:KRK_PARENT_SHA,
   premises:'K and k opposed two ranks apart, rook file margin >=2, rook rank distinct from k',
   continuation:wy===7?'Checkmate immediately at the edge':
     'Every legal reply advances the weak king exactly one rank. If file margin >=4 the exact king-up phase is certified.',
   proofContext:Object.freeze({strong,sk,rookFile:rx,
     weakFile:wx,weakRank:wy,startingMargin:Math.abs(rx-wx),frame}),
   inputHalfmove:state.halfmove,inputHistoryLength:state.history.length,
   isCompleteWinningPolicy:false,maxMatePlies:null});
}

export function auditKRKOppositionCheck(state,frame='id'){
 const c=krkOppositionCheckChoice(state,frame);
 if(!c)return {ok:false,replies:0};
 const p=framed(state,frame),after=applyMove(state.board,c.move);
 const res=outcome(after,p.weak,[],state.halfmove+1);
 if(p.wy===7)
   return {ok:res.kind==='mate'&&res.winner===p.strong,
     mate:true,replies:0,terminal:'checkmate'};
 const replies=legalMoves(after,p.weak);
 if(!replies.length)return {ok:false,replies:0};
 for(const reply of replies){
   if(reply.capture||reply.piece!==p.weak+'K')
     return {ok:false,replies:replies.length,failedReply:reply};
   const b=applyMove(after,reply),wk=findKing(b,p.weak);
   const [x,y]=coords(krkTransformSquare(wk,frame));
   if(y!==p.wy+1||Math.abs(x-p.wx)>1)
     return {ok:false,replies:replies.length,failedReply:reply};
 }
 return {ok:true,replies:replies.length,
   followCertified:c.proofContext.startingMargin>=4};
}

/** Only when the exact prior checking root is supplied and verified. */
export function krkOppositionFollowChoice(state,context){
 if(!context||!KRK_FRAMES.includes(context.frame)||
     !['w','b'].includes(context.strong)||state?.turn!==context.strong||
     context.startingMargin<4||state.material!=='krk'||!Array.isArray(state.history)||
     !Number.isInteger(state.halfmove)||state.halfmove<0)return null;
 const strong=state.turn,weak=opposite(strong),b=state.board;
 if(validateSetup(b,'krk',strong)!==null||outcome(b,strong,state.history,state.halfmove).kind!=='ongoing')return null;
 const sk=findKing(b,strong),rook=b.indexOf(strong+'R'),wk=findKing(b,weak);
 if(sk!==context.sk||rook<0||wk<0)return null;
 const [sx,sy]=coords(krkTransformSquare(sk,context.frame));
 const [rx,ry]=coords(krkTransformSquare(rook,context.frame));
 const [wx,wy]=coords(krkTransformSquare(wk,context.frame));
 if(sx!==context.weakFile||sy+2!==context.weakRank||
    rx!==context.rookFile||ry!==context.weakRank||
    wy!==context.weakRank+1||Math.abs(wx-context.weakFile)>1)return null;
 const target=krkTransformSquare(squareAt(sx,sy+1),context.frame);
 const move=legalMoves(b,strong).find(m=>m.from===sk&&m.to===target);
 if(!move)return null;
 return Object.freeze({kind:'step',move,frame:context.frame,
   phase:'OPPOSITION check follow-up: strong king one rank up',
   rule:KRK_OPPOSITION_LEMMAS.follow,parent:KRK_PARENT_SHA,
   weakStartRank:context.weakRank,
   continuation:'All defender replies retain a distant rank barrier; 7-weak rank strictly decreases.',
   isCompleteWinningPolicy:false,maxMatePlies:null});
}

export function auditKRKOppositionFollow(state,context){
 const c=krkOppositionFollowChoice(state,context);
 if(!c)return {ok:false,replies:0};
 const after=applyMove(state.board,c.move),weak=opposite(state.turn);
 const replies=legalMoves(after,weak);
 if(!replies.length)return {ok:false,replies:0};
 const [sx,sy]=coords(krkTransformSquare(findKing(after,state.turn),context.frame));
 const rook=after.indexOf(state.turn+'R');
 const [rx,ry]=coords(krkTransformSquare(rook,context.frame));
 for(const reply of replies){
   if(reply.capture||reply.piece!==weak+'K')
     return {ok:false,replies:replies.length,failedReply:reply};
   const b=applyMove(after,reply),wk=findKing(b,weak);
   const [wx,wy]=coords(krkTransformSquare(wk,context.frame));
   if(!(sy<ry&&ry<wy)||Math.max(Math.abs(rx-wx),Math.abs(ry-wy))<2||
     !(7-wy<7-context.weakRank))
     return {ok:false,replies:replies.length,failedReply:reply};
 }
 return {ok:true,replies:replies.length,rankDrop:true};
}

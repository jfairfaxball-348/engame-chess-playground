/**
 * S040: independent local authentication of the FOUR real S039 later KQK
 * theorem families. Diagnostic only: do not use these checks to select moves.
 *
 * Locked source c72365a8ba46f59114a2a77d9d38993f6a52df80:
 *   BandEntry.wall_prepare_bound / preparation_step,
 *   BandProgress.prepared_king_step / prepared_queen_step,
 *   RankFive.rank_five_corner_bound.
 * This verifies concrete premises, source's exact first action, and where
 * asserted the ALL-legal-replies invariant. It is not Lean proof extraction,
 * a global mate tree or FIDE history certification.
 */
import {pathToFileURL} from 'node:url';
import {
  applyMove,coords,inCheck,legalMoves,newGame,opposite,positionKey,
  validateSetup
} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES} from './kqk32-far-file-audit.mjs';
import {auditS039SourcePairs} from './s039-source-phase-pairs.mjs';

const WALL='KQK.BandEntry.wall_prepare_bound.horizontal';
const QUEEN='KQK.BandProgress.prepared_queen_step';
const KING='KQK.BandProgress.prepared_king_step';
const CORNER='KQK.RankFive.rank_five_corner_bound';
export const S040_RULES=Object.freeze([WALL,QUEEN,KING,CORNER]);
const bad=reason=>({status:'failed-premise',reason});
const potential=(k,q)=>q[1]-1-k[1]+Math.abs(k[0]-q[0]);
const bandPotential=(k,q)=>2*(7-k[0])+2*(7-q[0])+4*(5-q[1]);
const wall=(k,q,w)=>k[1]<q[1]&&q[1]<w[1]&&q[0]<w[0];
const openBand=q=>q[1]<=4||(q[1]===5&&q[0]<=5);
const prepared=(k,q,w)=>wall(k,q,w)&&q[1]<=5&&
  k[1]+1===q[1]&&q[0]<=k[0]&&k[0]<=w[0];
const transformed=(board,strong,frame)=>{
  const f=KQK32_FRAMES[frame],weak=opposite(strong);
  if(!f)return null;
  const sk=board.indexOf(strong+'K'),q=board.indexOf(strong+'Q'),
    wk=board.indexOf(weak+'K');
  if(sk<0||q<0||wk<0)return null;
  return {sk,q,wk,k:f(coords(sk)),qxy:f(coords(q)),w:f(coords(wk))};
};
const equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/**
 * Independent verifier for precisely one named frozen source application.
 * The immediate reply enumeration is complete (not sampled); rank and
 * invariance requirements are applied only where stated by the theorem.
 *
 * The optional token is the ACTUALLY issued prior source continuation,
 * not a synthetic geometry fixture. It is checked for frame and identity.
 */
export function authenticateS040LaterAction(state,strong,choice,token=null){
  const phase=choice?.sourcePhase;
  if(!S040_RULES.includes(phase))
    return {status:'not-independently-checked',theorem:phase??null};
  if(state?.material!=='kqk'||state.turn!==strong||
     validateSetup(state.board,'kqk',strong)!==null)
    return bad('not a legal KQK strong-turn theorem position');
  if(!Object.hasOwn(KQK32_FRAMES,choice.frame))
    return bad('unknown source theorem frame');
  if(token!==null){
    if(token.frame!==choice.frame||token.strong!==strong||
       state.log.length!==token.moveCount+1||
       state.board[token.king]!==strong+'K'||
       state.board[token.queen]!==strong+'Q')
      return bad('source-issued token/frame/history identity mismatch');
    const weakNow=state.board.indexOf(opposite(strong)+'K');
    const weakOld=token.weak;
    const [x,y]=coords(weakNow),[u,v]=coords(weakOld);
    if(weakOld===weakNow||Math.max(Math.abs(x-u),Math.abs(y-v))!==1)
      return bad('token does not span exactly one legal weak king step');
  }
  const g=transformed(state.board,strong,choice.frame);
  if(!g)return bad('missing framed three-piece KQK geometry');
  const {sk,q,wk,k,qxy,w}=g;
  const [kx,ky]=k,[qx,qy]=qxy,[wx,wy]=w;
  const validWall=wall(k,qxy,w);
  const isPrepared=prepared(k,qxy,w);
  if(inCheck(state.board,opposite(strong)))
    return bad('frozen source requires a non-checking strong-turn board');
  let from,to,rankBefore=null,rankAfter=null;
  if(phase===WALL){
    if(!validWall||!openBand(qxy)||ky+1!==qy||kx===qx)
      return bad('BandEntry Wall/OpenBand/notReady/horizontal premises fail');
    from=sk;to=[kx+(qx>kx?1:-1),ky];
    rankBefore=potential(k,qxy);rankAfter=potential(to,qxy);
    if(rankAfter+1!==rankBefore)
      return bad('BandEntry exact preparationPotential decrease fails');
  }else if(phase===KING){
    if(!isPrepared||kx+2>wx)
      return bad('prepared_king_step Prepared/gap premise fails');
    from=sk;to=[kx+1,ky];
    rankBefore=bandPotential(k,qxy);
    rankAfter=bandPotential(to,qxy);
    if(rankAfter+2>rankBefore)
      return bad('prepared_king_step bandPotential decrease fails');
  }else if(phase===QUEEN){
    if(!isPrepared||wx>kx+1||qx+2>wx||
       !(qy<5||wy<7||wx<7))
      return bad('prepared_queen_step Prepared/close/gap/notCorner premise fails');
    from=q;to=[wx-1,qy];
    rankBefore=bandPotential(k,qxy);
    rankAfter=bandPotential(k,to);
    if(rankAfter+2>rankBefore)
      return bad('prepared_queen_step bandPotential decrease fails');
  }else{
    if(!(ky<=4&&qy===5&&qx!==5&&wx===7&&wy===7))
      return bad('rank_five_corner_bound five source premises fail');
    from=q;to=[5,5];
  }
  const frame=KQK32_FRAMES[choice.frame];
  if(choice.move?.from!==from||!Number.isInteger(choice.move?.to)||
     !equals(frame(coords(choice.move.to)),to))
    return bad('selected move differs from exact Lean constructor target');
  const legal=legalMoves(state.board,strong).find(m=>
    m.from===choice.move.from&&m.to===choice.move.to);
  if(!legal)return bad('exact source action is not legally playable');
  const after=applyMove(state.board,legal),weak=opposite(strong);
  const replies=legalMoves(after,weak);
  // BandEntry's and BandProgress's induction/pair constructors demand
  // a genuine defender reply; the corner proof may end at checkmate.
  if(phase!==CORNER&&!replies.length)
    return bad('frozen pair step requires an existing weak reply');
  if(replies.some(r=>r.capture===strong+'Q'))
    return bad('a legal defender reply can capture the queen');
  const afterGeometry=transformed(after,strong,choice.frame);
  for(const reply of replies){
    const child=applyMove(after,reply),h=transformed(child,strong,choice.frame);
    if(!h||validateSetup(child,'kqk',strong)!==null||
       inCheck(child,weak))
      return bad('legal defender reply fails KQK/noncheck invariant');
    if(phase===WALL){
      if(!wall(h.k,h.qxy,h.w)||!equals(h.qxy,afterGeometry.qxy)||
         potential(h.k,h.qxy)!==rankAfter)
        return bad('wall/queen/preparation rank lost after defender reply');
    }
    if((phase===KING||phase===QUEEN)&&
       (!prepared(h.k,h.qxy,h.w)||!equals(h.k,afterGeometry.k)||
        !equals(h.qxy,afterGeometry.qxy)||
        bandPotential(h.k,h.qxy)!==rankAfter))
      return bad('Prepared or potential not preserved for every weak reply');
  }
  return {status:'authenticated',theorem:phase,frame:choice.frame,
    exactMove:choice.move.from+'-'+choice.move.to,
    legalWeakReplies:replies.length,rankBefore,rankAfter,
    scope:'source premises, exact constructor and local all-reply postcondition only'};
}

function sourceMove(state,id){
  const [from,to]=id.split('-').map(Number);
  const move=legalMoves(state.board,state.turn).find(m=>
    m.from===from&&m.to===to);
  if(!move)throw Error('S040 exact source replay cannot legally play '+id);
  return mathsPlayMove(state,move);
}
function parseRoot(key){
  const [pieces,turn]=key.split(':');
  if(pieces?.length!==128||!['w','b'].includes(turn))
    throw Error('S040 invalid positionKey root identity');
  const board=pieces.match(/.{2}/g).map(p=>p==='--'?null:p);
  return newGame(board,turn,'kqk',{experimentalKQK:true});
}

/** Replay original legal roots and complete four-ply logs, not new fixtures.
 * The S039 source selector is read-only. This audit NEVER selects a move.
 */
export function auditS040Premises(options={}){
  const previous=auditS039SourcePairs(options);
  const r={sourceSha:KQK_PROOF_SOURCE_SHA,
    checkedRoots:previous.genuinePreparedRoots,
    secondWeakReplies:previous.secondWeakReplies,
    thirdMoves:previous.thirdSourceMoves,
    rules:{},independentlyAuthenticated:0,failedPremises:0,
    uncheckedRules:0,firstFailure:null,firstUnchecked:null,
    firstQueenExample:null,firstAuthentication:null,
    allSourceReplayExact:true,globalMateCertified:false,
    krkGlobalPhaseCompositionCertified:false,fideHistoryCertified:false,
    s039:{firstActualGap:previous.firstActualGap,
      firstUnverifiedTheorem:previous.firstUnverifiedTheorem,
      firstUncheckedLaterTheorem:previous.firstUncheckedLaterTheorem,
      firstPotentialCycle:previous.firstPotentialCycle,
      firstResourceCap:previous.firstResourceCap,
      firstKRKCrossPhase:previous.firstKRKCrossPhase,
      firstKRKRestoration:previous.firstKRKRestoration,
      outcomes:previous.outcomes},
    examples:[]};
  for(const entry of previous.roots){
    const root=parseRoot(entry.root),strong=entry.strong;
    const prep=kqkSourceChoice(root,strong);
    if(!prep?.move||!equals(prep.continuationPhase,entry.token)||
       prep.move.from+'-'+prep.move.to!==entry.firstAction)
      throw Error('S040 replay root or exact preparation token drift');
    const afterPrep=sourceMove(root,entry.firstAction);
    for(const first of entry.firstReplies){
      const state1=sourceMove(afterPrep,first.weakReply);
      if(!equals(state1.log,first.moveHistory)||
         positionKey(state1.board,state1.turn)!==first.state)
        throw Error('S040 first defender legal history identity drift');
      if(!first.selectedAction)continue;
      const a1=kqkSourceChoice(state1,strong,entry.token);
      if(!a1?.move||a1.move.from+'-'+a1.move.to!==first.selectedAction)
        throw Error('S040 actual second attacker source token drift');
      const afterA1=sourceMove(state1,first.selectedAction);
      for(const second of first.secondReplies){
        if(second.result!=='source')continue;
        const state2=sourceMove(afterA1,second.weakReply);
        if(!equals(state2.log,second.moveHistory)||
           positionKey(state2.board,state2.turn)!==second.state)
          throw Error('S040 second defender full history identity drift');
        const token=a1.continuationPhase??null;
        if(!equals(token,second.continuationToken))
          throw Error('S040 true nested continuation token drift');
        const a2=kqkSourceChoice(state2,strong,token);
        if(!a2?.move||a2.sourcePhase!==second.selectedRule||
           a2.frame!==second.selectedFrame||
           a2.move.from+'-'+a2.move.to!==second.selectedAction)
          throw Error('S040 third source action/frame drift');
        const check=authenticateS040LaterAction(state2,strong,a2,token);
        const rule=a2.sourcePhase;
        const count=r.rules[rule]??{total:0,authenticated:0,
          failedPremise:0,unchecked:0};
        count.total++;
        const record={root:entry.root,strong,originalFrame:entry.frame,
          selectedFrame:a2.frame,initialToken:entry.token,
          continuationToken:token,sourceRule:rule,action:second.selectedAction,
          state:second.state,moveHistory:state2.log,check};
        if(check.status==='authenticated'){
          r.independentlyAuthenticated++;count.authenticated++;
          if(!r.firstAuthentication)r.firstAuthentication=record;
        }else if(check.status==='failed-premise'){
          r.failedPremises++;count.failedPremise++;
          if(!r.firstFailure)r.firstFailure=record;
        }else{
          r.uncheckedRules++;count.unchecked++;
          if(!r.firstUnchecked)r.firstUnchecked=record;
        }
        if(rule===QUEEN&&r.firstQueenExample===null)r.firstQueenExample=record;
        if(options.full===true)r.examples.push(record);
        r.rules[rule]=count;
      }
    }
  }
  if(r.independentlyAuthenticated+r.failedPremises+r.uncheckedRules!==r.thirdMoves)
    throw Error('S040 did not account for every real third source action');
  return r;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const option=(k,d)=>{
    const x=process.argv.find(a=>a.startsWith('--'+k+'='));
    return x?Number(x.slice(k.length+3)):d;
  };
  const r=auditS040Premises({
    maxTuples:option('tuples',1600),maxPrepared:option('prepared',10),
    maxNodes:option('nodes',320),maxPairs:option('pairs',56),
    maxKrkRoots:option('krk-roots',4),
    full:process.argv.includes('--full')});
  console.log(JSON.stringify(r,null,2));
  if(process.argv.includes('--strict')&&
     (!r.checkedRoots||!r.secondWeakReplies||r.failedPremises||
      r.uncheckedRules||!r.firstQueenExample))
    process.exitCode=1;
}

/**
 * S035 — independent frozen-lemma checks at two genuine source handoffs.
 *
 * DIAGNOSTIC ONLY. Every strong move is obtained from the existing tagged
 * controller, every defender move is legal, and tokens come only from the
 * actual preceding source action. No chess search, fabricated token, sampled
 * weak reply, phase ranking or runtime strategy selection occurs here.
 */
import {pathToFileURL} from 'node:url';
import {applyMove,coords,inCheck,legalMoves,makeBoard,newGame,
  opposite,outcome,play,positionKey,squareAt,validateSetup}
  from '../src/chess.js';
import {KQK_PROOF_SOURCE_SHA,kqkSourceChoice}
  from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {KQK32_FRAMES,kqk32CaseFromState,kqk32FixtureRoots}
  from './kqk32-far-file-audit.mjs';
import {kqk34CandidateRoots} from './kqk34-reachability.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';
import {krk15StratifiedRoots} from './krk15-stratified-mate-audit.mjs';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';
import {krkPrepState} from '../src/krk-prep-controller.js';

const LOW='KQK.EntryGeometry.clear_low_wall_entry.queen_wall';
const TIGHT='KQK.TightEntry.tight_king_step.king_approach';
const fail=reason=>({authenticated:false,reason});

/** The EXACT low_right_entry action in frozen EntryGeometry.lean.
 * In the theorem's ORIGINAL frame require its full clear_low_wall_entry
 * premises; prove the claimed move is Q(q.file,king.rank+1), legal,
 * non-stalemating and queen-safe against all immediate weak replies.
 * The theorem permits this framed instance; it is not global mate closure.
 */
export function authenticateKQK35LowWall(state,strong,choice,frame){
  if(state?.material!=='kqk'||state.turn!==strong||
     choice?.sourcePhase!==LOW||choice.frame!==frame||
     !Object.hasOwn(KQK32_FRAMES,frame))
    return fail('wrong state, rule or original source frame');
  const b=state.board,weak=opposite(strong),
    sk=b.indexOf(strong+'K'),q=b.indexOf(strong+'Q'),w=b.indexOf(weak+'K');
  if(sk<0||q<0||w<0||inCheck(b,weak))
    return fail('KQK source requires a non-checking legal strong-turn position');
  const f=KQK32_FRAMES[frame], [kx,ky]=f(coords(sk)),
    [qx,qy]=f(coords(q)),[wx,wy]=f(coords(w));
  if(!(ky+2<=wy&&ky<=4&&(qx!==kx||ky<qy)&&
       Math.abs(qx-wx)>=2&&qy!==ky+1))
    return fail('frozen clear_low_wall_entry / low_right_entry premises fail');
  if(choice.move?.from!==q||choice.move?.to===undefined)
    return fail('wrong source piece');
  const [tx,ty]=f(coords(choice.move.to));
  if(tx!==qx||ty!==ky+1)
    return fail('not the source exact Q(queen.file,king.rank+1) action');
  if(!legalMoves(b,strong).some(m=>m.from===q&&m.to===choice.move.to))
    return fail('source action not legal');
  const after=applyMove(b,choice.move),replies=legalMoves(after,weak);
  if(!replies.length||replies.some(r=>r.capture===strong+'Q'))
    return fail('missing frozen legal weak reply or unprotected queen');
  return {authenticated:true,frame,source:LOW,
    theorem:'KQK.EntryGeometry.clear_low_wall_entry / low_right_entry',
    legalWeakReplies:replies.length};
}

/** Exact first tight_king_step from frozen TightEntry.lean on a real legal
 * already-far-file root (never on a manufactured preparation token).
 */
export function authenticateKQK35TightKing(state,strong,choice){
  if(state?.material!=='kqk'||state.turn!==strong||
     choice?.sourcePhase!==TIGHT||
     !Object.hasOwn(KQK32_FRAMES,choice.frame))
    return fail('not a tight_king_step source action');
  const b=state.board,weak=opposite(strong),
    sk=b.indexOf(strong+'K'),q=b.indexOf(strong+'Q'),w=b.indexOf(weak+'K');
  if(sk<0||q<0||w<0||inCheck(b,weak))return fail('illegal theorem input');
  const f=KQK32_FRAMES[choice.frame], [kx,ky]=f(coords(sk)),
    [qx,qy]=f(coords(q)),[wx,wy]=f(coords(w));
  if(!(qx<=1&&wx>=3&&qy===ky+2&&wy===ky+1&&
       Math.abs(kx-wx)>=2&&qx!==kx+1))
    return fail('frozen tight_above_entry / tight_king_step premises fail');
  if(choice.move?.from!==sk||choice.move?.to===undefined)
    return fail('wrong source piece');
  const [tx,ty]=f(coords(choice.move.to));
  if(tx!==kx||ty!==wy)return fail('not the source exact K(king.file,weak.rank)');
  if(!legalMoves(b,strong).some(m=>m.from===sk&&m.to===choice.move.to))
    return fail('king step not legal');
  const replies=legalMoves(applyMove(b,choice.move),weak);
  if(!replies.length||replies.some(r=>r.capture===strong+'Q'))
    return fail('weak reply existence or protected queen failed');
  return {authenticated:true,frame:choice.frame,source:TIGHT,
    theorem:'KQK.TightEntry.tight_above_entry / tight_king_step',
    legalWeakReplies:replies.length};
}

export function auditKQK35SourceBridges({maxLegalRoots=1200,
  maxPreparedRoots=32,maxExamples=10}={}){
  for(const n of [maxLegalRoots,maxPreparedRoots,maxExamples])
    if(!Number.isSafeInteger(n)||n<1)throw RangeError('positive finite audit caps required');
  const r={sourceSha:KQK_PROOF_SOURCE_SHA,
    scope:{maxLegalRoots,maxPreparedRoots,fixtures:16},
    candidateRoots:0,preparedRoots:0,firstWeakReplies:0,
    lowWallAuthenticated:0,backrankAuthenticated:0,
    missingFirst:0,unverifiedFirst:0,secondWeakReplies:0,
    secondSourceMoves:0,missingSecond:0,sourceRules:{},unresolved:[],
    genuineSourceTokensOnly:true,globalMateCertified:false};
  const witness=(reason,root,state,detail={})=>{
    if(r.unresolved.length<maxExamples)r.unresolved.push({reason,
      root,at:positionKey(state.board,state.turn),...detail});
  };
  const seen=new Set();
  function* candidates(){yield* kqk32FixtureRoots();yield* kqk34CandidateRoots(maxLegalRoots);}
  for(const {root,strong} of candidates()){
    if(r.preparedRoots>=maxPreparedRoots)break;
    const key=positionKey(root.board,root.turn);
    if(seen.has(key))continue;
    seen.add(key);r.candidateRoots++;
    const first=kqkSourceChoice(root,strong);
    if(first?.continuationPhase?.kind!=='far-file'||
       !first.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))
      continue;
    r.preparedRoots++;
    const after=mathsPlayMove(root,first.move),weak=opposite(strong);
    for(const weakMove of legalMoves(after.board,weak)){
      r.firstWeakReplies++;
      const state=mathsPlayMove(after,weakMove);
      const selected=kqkSourceChoice(state,strong,first.continuationPhase);
      if(!selected?.move){
        r.missingFirst++;
        witness('missing first source',key,state);
        continue;
      }
      r.sourceRules[selected.sourcePhase]=(r.sourceRules[selected.sourcePhase]??0)+1;
      // Authenticate the exact SELECTED source theorem. In the original
      // frame low_right_entry is a subcase of FarFileEntry direct-small-file;
      // in a switched frame the backrank rule has its OWN premise proof.
      const a=selected.frame===first.continuationPhase.frame
        ?authenticateKQK35LowWall(state,strong,selected,first.continuationPhase.frame)
        :authenticateKQK33Backrank(state,strong,selected);
      if(!a.authenticated){
        r.unverifiedFirst++;
        witness(a.reason??'unsupported cross-theorem authentication',key,state,
          {originalCase:kqk32CaseFromState(state,strong,first.continuationPhase.frame),
          rule:selected.sourcePhase,chosenFrame:selected.frame});
      }else if(selected.sourcePhase===LOW)r.lowWallAuthenticated++;
      else r.backrankAuthenticated++;
      const next=mathsPlayMove(state,selected.move);
      if(outcome(next.board,next.turn,next.history,next.halfmove).kind!=='ongoing')
        continue;
      for(const weak2 of legalMoves(next.board,weak)){
        r.secondWeakReplies++;
        const child=mathsPlayMove(next,weak2);
        const status=outcome(child.board,child.turn,child.history,child.halfmove);
        if(status.kind!=='ongoing')continue;
        const follow=kqkSourceChoice(child,strong,selected.continuationPhase??null);
        if(follow?.move)r.secondSourceMoves++;
        else{
          r.missingSecond++;
          witness('missing source after second weak reply',key,child,
            {rule:selected.sourcePhase});
        }
      }
    }
  }
  return {...r,note:'Literal low-wall action in original frame and independently justified backrank in switched frame. Bounded sources and two defender layers, NOT universal mating.'};
}

/** Unaltered legal S033 already-far-file roots, with all symmetries.
 * Separating and tight-above cannot be counted as prepared-token cases
 * merely by placing a matching board; no token is invented here.
 */
export function auditKQK35AlreadyFarTight(){
  const sample={k:[1,1],q:[0,3],w:[4,2]};
  const r={legalRoots:0,correctOriginalCase:0,sourceFirst:0,
    tightKingActions:0,tightKingAuthenticated:0,
    alternateNamedSource:0,missingFirst:0,firstWeakReplies:0,
    followOnMoves:0,missingFollowOn:0,unresolved:[],
    preparatoryTokensFabricated:false,completeGamesCertified:false};
  for(const strong of ['w','b'])
    for(const [frame,f] of Object.entries(KQK32_FRAMES)){
      const b=makeBoard(),weak=opposite(strong);
      b[squareAt(...f(sample.k))]=strong+'K';
      b[squareAt(...f(sample.q))]=strong+'Q';
      b[squareAt(...f(sample.w))]=weak+'K';
      if(validateSetup(b,'kqk',strong)!==null)throw Error('invalid tight fixture');
      const root=newGame(b,strong,'kqk',{experimentalKQK:true});
      r.legalRoots++;
      const inverse=frame==='rotate90'?'rotate270':
        frame==='rotate270'?'rotate90':frame;
      if(kqk32CaseFromState(root,strong,inverse)!=='tight-above')
        throw Error('original tight case lost by symmetry');
      r.correctOriginalCase++;
      const first=kqkSourceChoice(root,strong);
      if(!first?.move){r.missingFirst++;continue;}
      r.sourceFirst++;
      if(first.sourcePhase===TIGHT){
        r.tightKingActions++;
        const auth=authenticateKQK35TightKing(root,strong,first);
        if(auth.authenticated)r.tightKingAuthenticated++;
        else r.unresolved.push({reason:auth.reason,frame,strong,
          at:positionKey(root.board,root.turn)});
      }else r.alternateNamedSource++;
      const after=mathsPlayMove(root,first.move);
      for(const reply of legalMoves(after.board,weak)){
        r.firstWeakReplies++;
        const state=mathsPlayMove(after,reply);
        const status=outcome(state.board,state.turn,state.history,state.halfmove);
        if(status.kind!=='ongoing')continue;
        const follow=kqkSourceChoice(state,strong,first.continuationPhase??null);
        if(follow?.move)r.followOnMoves++;
        else{
          r.missingFollowOn++;
          if(r.unresolved.length<12)r.unresolved.push({reason:'missing tight-case continuation',
            frame,strong,at:positionKey(state.board,state.turn),source:first.sourcePhase});
        }
      }
    }
  return r;
}

/** Source-backed KRK PREP phase transfer. Enumerate two actual defender
 * replies first, then take ONLY a live tagged third source action with
 * sourcePhase=prep. The frozen KRKCentral.prep_pair / WallActions
 * preparation rank must descend after EVERY legal next weak reply in
 * the SAME frame. Setup->prep is not yet a global phase termination proof.
 */
export function auditKRK35PrepTransfer({maxExamples=12}={}){
  const r={roots:0,firstReplies:0,secondReplies:0,
    actualThirdPrepChoices:0,prepReplies:0,strictDescent:0,
    reachedReady:0,sourceNextChoices:0,missingNext:0,
    invalidRankOrTransfer:0,failures:[],
    frozenLocalLemma:'KRKCentral.prep_pair / KRKForcing.WallActions',
    globalPhaseCompositionCertified:false};
  for(const {phase,strong,frame,state:root} of krk15StratifiedRoots()){
    r.roots++;
    const first=krkTaggedStrongChoice(root);
    if(!first?.move)throw Error('S035 KRK root lacks source: '+phase);
    const a=play(root,first.move),weak=opposite(strong);
    for(const move1 of legalMoves(a.board,weak)){
      r.firstReplies++;
      if(move1.capture)throw Error('KRK first source lost rook');
      const state1=play(a,move1);
      const second=krkTaggedStrongChoice(state1,first.continuationPhase);
      if(!second?.move)throw Error('KRK second source missing');
      const b=play(state1,second.move);
      for(const move2 of legalMoves(b.board,weak)){
        r.secondReplies++;
        if(move2.capture)throw Error('KRK second source lost rook');
        const state2=play(b,move2);
        if(outcome(state2.board,state2.turn,state2.history,state2.halfmove).kind!=='ongoing')
          continue;
        const third=krkTaggedStrongChoice(state2,second.continuationPhase);
        if(!third?.move)throw Error('KRK third source missing');
        if(third.sourcePhase!=='prep')continue;
        r.actualThirdPrepChoices++;
        const info=krkPrepState(state2,third.frame);
        const thirdAfter=play(state2,third.move);
        const replies=legalMoves(thirdAfter.board,weak);
        if(!info||info.ready||!replies.length){
          r.invalidRankOrTransfer++;
          if(r.failures.length<maxExamples)r.failures.push({reason:'no prep input rank or weak replies',
            phase,frame,at:positionKey(state2.board,state2.turn),
            source:third.rule,rank:info?.rank??null});
          continue;
        }
        for(const reply of replies){
          r.prepReplies++;
          const child=play(thirdAfter,reply);
          const afterRank=krkPrepState(child,third.frame);
          if(reply.capture||!afterRank||afterRank.rank>=info.rank){
            r.invalidRankOrTransfer++;
            if(r.failures.length<maxExamples)r.failures.push({
              reason:'frozen local prep rank did not descend',
              phase,frame,at:positionKey(state2.board,state2.turn),
              weakMove:[reply.from,reply.to],rankBefore:info.rank,
              rankAfter:afterRank?.rank??null});
            continue;
          }
          r.strictDescent++;
          if(afterRank.ready)r.reachedReady++;
          const next=krkTaggedStrongChoice(child,third.continuationPhase);
          if(next?.move)r.sourceNextChoices++;
          else {
            r.missingNext++;
            if(r.failures.length<maxExamples)r.failures.push({
              reason:'strict prep rank without matching tagged next action',
              phase,frame,at:positionKey(child.board,child.turn)});
          }
        }
      }
    }
  }
  return {...r,note:'Real third source choices from two full legal weak reply layers; only strict PREP edges carry the frozen rank. Central/restoration/global termination remain unresolved.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const report={kqk:auditKQK35SourceBridges(),
    alreadyFarTight:auditKQK35AlreadyFarTight(),
    krkPrepTransfer:auditKRK35PrepTransfer()};
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--strict')&&(
    report.kqk.missingFirst||report.kqk.unverifiedFirst||
    report.krkPrepTransfer.invalidRankOrTransfer||
    report.krkPrepTransfer.missingNext||
    report.alreadyFarTight.tightKingActions!==
      report.alreadyFarTight.tightKingAuthenticated))process.exitCode=1;
}

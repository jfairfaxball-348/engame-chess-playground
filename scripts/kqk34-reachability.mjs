/**
 * S034: bounded ORIGINAL-frame case reachability from real KQK source steps.
 *
 * Diagnostics only. Never invents continuation tokens, changes the Maths
 * selector, or substitutes legal moves for missing frozen-source actions.
 * Case witnesses use an actual selected FarFilePreparation action followed
 * by EVERY legal weak reply. A different-frame source is not automatically
 * the original frame's constructive theorem.
 */
import {pathToFileURL} from 'node:url';
import {coords,legalMoves,makeBoard,newGame,opposite,outcome,positionKey,
  squareAt,validateSetup} from '../src/chess.js';
import {kqkSourceChoice,KQK_PROOF_SOURCE_SHA} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {kqk32CaseFromState,kqk32FixtureRoots}
  from './kqk32-far-file-audit.mjs';
import {authenticateKQK33Backrank}
  from './kqk33-source-correspondence.mjs';

const CASES=['separating-rank','direct-small-file','horizontal-far-wall','tight-above'];

/**
 * Finite exhaustive check of the source arithmetic obstruction:
 * preWeakRank >= kingRank+2, queenRank != preWeakRank; one weak king move
 * changes rank by at most one. A tight-above post reply would require
 * queenRank=kingRank+2, postWeakRank=kingRank+1, and hence
 * preWeakRank=kingRank+2=queenRank, contradiction.
 *
 * No king legality, chosen move or symmetry assumption is needed.
 */
export function auditKQK34TightObstruction(){
  let premises=0,tight=0;
  for(let k=0;k<8;k++)for(let q=0;q<8;q++)
    for(let before=0;before<8;before++)for(let after=0;after<8;after++){
      if(before<k+2||q===before||Math.abs(after-before)>1)continue;
      premises++;
      if(q===k+2&&after===k+1)tight++;
    }
  return {premiseRankTuples:premises,tightPostconditions:tight,
    impossibleAfterGenuinePreparation:tight===0,
    scope:'all 8x8 rank tuples under the frozen preparation hypotheses and one-step weak movement; independent of runtime selector'};
}

/** Deterministic legal-root probe, intentionally a BOUNDED canonical
 * subregion, not a proof that other FarFilePreparation cases are absent.
 * The source itself chooses whether any given board admits preparation.
 */
export function* kqk34CandidateRoots(maxLegalRoots=6000){
  let legal=0;
  for(const strong of ['w','b'])
    for(let ky=0;ky<=4;ky++)for(let kx=0;kx<8;kx++)
      for(let qy=0;qy<8;qy++)for(let qx=2;qx<8;qx++)
        for(let wy=0;wy<8;wy++)for(let wx=4;wx<8;wx++){
          if(wy<ky+2||qy===ky||qy===wy)continue;
          const board=makeBoard(),weak=opposite(strong);
          const sk=squareAt(kx,ky),qs=squareAt(qx,qy),wk=squareAt(wx,wy);
          if(new Set([sk,qs,wk]).size!==3)continue;
          board[sk]=strong+'K';board[qs]=strong+'Q';board[wk]=weak+'K';
          if(validateSetup(board,'kqk',strong)!==null)continue;
          if(legal++>=maxLegalRoots)return;
          yield {strong,frame:'canonical-probe',
            root:newGame(board,strong,'kqk',{experimentalKQK:true})};
        }
}

/** Report source-authenticated one-reply cases and a second layer of
 * ACTUAL weak replies, with exact fail-closed state keys. Resources are
 * explicit; no count here is a universal statement.
 */
export function auditKQK34Reachability({
  maxLegalRoots=6000,maxPreparedRoots=64,maxExamples=12
}={}){
  for(const [name,v] of Object.entries({maxLegalRoots,maxPreparedRoots,maxExamples}))
    if(!Number.isSafeInteger(v)||v<1)throw new RangeError(name+' must be positive');
  const report={sourceSha:KQK_PROOF_SOURCE_SHA,
    scope:{maxLegalRoots,maxPreparedRoots,seededFixtures:16},
    candidateRoots:0,preparedRoots:0,defenderReplies:0,
    originalCases:Object.fromEntries(CASES.map(c=>[c,0])),
    firstWitnesses:{},selectedSourceRules:{},
    sameFrame:0,crossFrame:0,authenticatedBackrank:0,
    independentUnverified:0,missingFirstSource:0,
    repeatedPreparation:0,unclassified:0,secondWeakReplies:0,
    secondSourceMoves:0,missingSecondSource:0,
    actualMates:0,otherTerminals:0,firstUnresolved:[],
    genuineTokensOnly:true,allDefenderTerminationCertified:false,
    originalCaseCorrespondenceCertified:false};
  const seen=new Set();
  const unresolved=(data)=>{
    if(report.firstUnresolved.length<maxExamples)report.firstUnresolved.push(data);
  };
  const candidates=(function*(){
    yield* kqk32FixtureRoots();
    yield* kqk34CandidateRoots(maxLegalRoots);
  })();
  for(const {strong,frame,root} of candidates){
    if(report.preparedRoots>=maxPreparedRoots)break;
    const key=positionKey(root.board,root.turn);
    if(seen.has(key))continue;seen.add(key);
    report.candidateRoots++;
    const first=kqkSourceChoice(root,strong);
    if(first?.continuationPhase?.kind!=='far-file'||
       !first.sourcePhase?.includes('FarFilePreparation.far_file_preparation'))continue;
    report.preparedRoots++;
    const token=first.continuationPhase;
    const after=mathsPlayMove(root,first.move);
    const weak=opposite(strong);
    for(const reply of legalMoves(after.board,weak)){
      report.defenderReplies++;
      const state=mathsPlayMove(after,reply);
      const originalCase=kqk32CaseFromState(state,strong,token.frame);
      if(Object.hasOwn(report.originalCases,originalCase))
        report.originalCases[originalCase]++;
      else report.unclassified++;
      const originalFrame=token.frame;
      if(!Object.hasOwn(report.firstWitnesses,originalCase??'outside')){
        report.firstWitnesses[originalCase??'outside']={
          root:key,fixtureFrame:frame,strong,originalFrame,
          firstMove:[first.move.from,first.move.to],
          weakMove:[reply.from,reply.to],
          post:positionKey(state.board,state.turn)};
      }
      if(originalCase==='tight-above')
        unresolved({reason:'tight after authentic preparation contradicts source arithmetic',
          at:positionKey(state.board,state.turn),root:key,originalFrame});
      const chosen=kqkSourceChoice(state,strong,token);
      if(!chosen?.move){
        report.missingFirstSource++;
        unresolved({reason:'missing first source',case:originalCase,
          root:key,at:positionKey(state.board,state.turn),originalFrame});
        continue;
      }
      report.selectedSourceRules[chosen.sourcePhase]=
        (report.selectedSourceRules[chosen.sourcePhase]??0)+1;
      if(chosen.sourcePhase?.includes('FarFilePreparation.far_file_preparation')){
        report.repeatedPreparation++;
        unresolved({reason:'forbidden repeat of FarFilePreparation',root:key,
          originalFrame,at:positionKey(state.board,state.turn)});
      }
      if(chosen.frame===originalFrame)report.sameFrame++;
      else {
        report.crossFrame++;
        const checked=authenticateKQK33Backrank(state,strong,chosen);
        if(checked.authenticated)report.authenticatedBackrank++;
        else{
          report.independentUnverified++;
          unresolved({reason:'different frame lacks independently checked theorem',
            originalCase,at:positionKey(state.board,state.turn),
            originalFrame,chosenFrame:chosen.frame,
            chosenSource:chosen.sourcePhase,
            theoremCheck:checked.reason});
        }
      }
      const afterChosen=mathsPlayMove(state,chosen.move);
      const status=outcome(afterChosen.board,afterChosen.turn,
        afterChosen.history,afterChosen.halfmove);
      if(status.kind!=='ongoing'){
        if(status.kind==='mate'&&status.winner===strong)report.actualMates++;
        else report.otherTerminals++;
        continue;
      }
      for(const reply2 of legalMoves(afterChosen.board,weak)){
        report.secondWeakReplies++;
        const secondState=mathsPlayMove(afterChosen,reply2);
        const nextStatus=outcome(secondState.board,secondState.turn,
          secondState.history,secondState.halfmove);
        if(nextStatus.kind!=='ongoing'){
          if(nextStatus.kind==='mate'&&nextStatus.winner===strong)report.actualMates++;
          else report.otherTerminals++;
          continue;
        }
        const following=kqkSourceChoice(secondState,strong,
          chosen.continuationPhase??null);
        if(following?.move)report.secondSourceMoves++;
        else{
          report.missingSecondSource++;
          unresolved({reason:'missing second source',case:originalCase,
            root:key,originalFrame,chosenSource:chosen.sourcePhase,
            at:positionKey(secondState.board,secondState.turn),
            weakMoves:[[reply.from,reply.to],[reply2.from,reply2.to]]});
        }
      }
    }
  }
  return {...report,arithmetic:auditKQK34TightObstruction(),
    note:'Source-issued tokens and actual weak replies only. Other-frame claims are checked only for the exact frozen Backrank theorem; all other cross-frame source rules remain independent proof obligations. The canonical subregion and second reply layer are finite falsification evidence.'};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const value=(label,fallback)=>{
    const arg=process.argv.find(x=>x.startsWith(label));
    return arg?Number(arg.slice(label.length)):fallback;
  };
  const report=auditKQK34Reachability({
    maxLegalRoots:value('--legal=',6000),
    maxPreparedRoots:value('--prepared=',64)});
  console.log(JSON.stringify(report,null,2));
  if(process.argv.includes('--strict')&&
     (report.unclassified||report.repeatedPreparation||
      report.originalCases['tight-above']||!report.arithmetic.impossibleAfterGenuinePreparation))
    process.exitCode=1;
}

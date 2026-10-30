/**
 * KRK14 all-defender complete-game FALSIFICATION. The sole strong-side
 * move chooser is krkTaggedStrongChoice (source-derived coordinates).
 * This tester enumerates defender moves; it NEVER selects the best move.
 * A successful finite root audit is not a universal Lean theorem.
 */
import {pathToFileURL} from 'node:url';
import {
  makeBoard,legalMoves,opposite,outcome,play,positionKey,squareAt,squareName
} from '../src/chess.js';
import {krkTaggedStrongChoice} from '../src/krk-tagged-strategy.js';

const uci=m=>squareName(m.from)+squareName(m.to);
function fen(board,turn){
  const rows=[];
  for(let y=7;y>=0;y--){
    let line='',n=0;
    for(let x=0;x<8;x++){
      const p=board[y*8+x];
      if(!p){n++;continue;}
      if(n){line+=n;n=0;}
      line+=p[0]==='w'?p[1]:p[1].toLowerCase();
    }
    if(n)line+=n;
    rows.push(line);
  }
  return rows.join('/')+' '+turn+' - - 0 1';
}

/** Read the chosen Lean-derived actions along a DIAGNOSTIC variation.
 * Replay uses the already-selected source rule at each strong turn; it does
 * not search for a winning move. This is only for counterexample triage.
 */
function annotateSourceTrace(root,variation){
  let s=root,token=null;
  const trace=[];
  for(let ply=0;ply<variation.length;ply++){
    const expected=variation[ply];
    if(ply%2===0){
      const choice=krkTaggedStrongChoice(s,token);
      if(!choice||uci(choice.move)!==expected)break;
      trace.push({ply:ply+1,fen:fen(s.board,s.turn),move:expected,
        rule:choice.rule,phase:choice.phase,sourcePhase:choice.sourcePhase,
        frame:choice.frame,preparedStage:token?.inner?.stage??null,
        centralStage:token?.inner?.inner?.stage??null,
        orientation:token?.inner?.inner?.orientation??null});
      s=play(s,choice.move);
      token=choice.continuationPhase;
    }else{
      const reply=legalMoves(s.board,s.turn).find(m=>uci(m)===expected);
      if(!reply)break;
      s=play(s,reply);
    }
  }
  return trace;
}

/**
 * A cycle detector must compare the ENTIRE deterministic source controller,
 * not just its outer phase or one nested stage. In particular, setup target
 * file, nested restoration stage, orientation and preceding rook-wall key
 * all affect which source lemma is legal next.
 *
 * Provenance counters are excluded: history length and halfmove rise even
 * when the same board/controller recurs, so including them would hide loops.
 * This is only a falsification key; FIDE history/clock obligations remain open.
 */
export function krk14ControlStateKey(token) {
  function projection(value) {
    if(Array.isArray(value))return value.map(projection);
    if(value&&typeof value==='object'){
      return Object.fromEntries(Object.entries(value)
        .filter(([key])=>key!=='historyLength'&&key!=='halfmove')
        .sort(([a],[b])=>a.localeCompare(b))
        .map(([key,entry])=>[key,projection(entry)]));
    }
    return value;
  }
  return JSON.stringify(projection(token));
}

/** Every legal weak continuation from ONE fresh or tagged strong root.
 * maxNodes/maxPlies are diagnostic resource limits, not mathematical bounds.
 */
export function auditKRK14MateTree(root,{maxNodes=12000,maxPlies=160}={}){
  const data={ok:false,scope:'one root, ALL legal defender replies',
    rootFEN:fen(root.board,root.turn),
    nodes:0,terminalMates:0,maximumPlies:0,
    structuralRevisits:0,distinctStructuralStates:0,
    distinctHistoryRevisits:0,defenderRepliesExamined:0,
    sourceChoicesExamined:0,maximumDefenderBranching:0,
    completeGlobalMateProof:false,fideClockHistoryCertified:false};
  const stack=new Set(),moves=[];
  // Diagnostic-only: detect transpositions without merging branches.
  // Repeated geometries with distinct incoming clocks/histories MUST NOT
  // be treated as interchangeable for FIDE/continuation semantics.
  const seenStructural=new Map();
  const fail=(reason,s,rule)=>({
    reason,atFEN:fen(s.board,s.turn),plies:moves.length,
    sourceRule:rule??null,variation:moves.slice()
  });
  function visit(s,token,ply){
    if(++data.nodes>maxNodes)return fail('node cap',s);
    data.maximumPlies=Math.max(data.maximumPlies,ply);
    if(ply>maxPlies)return fail('ply cap',s);
    // Full source control state avoids the KRK14 false cycle and any
    // further conflation of distinct nested phases or setup parameters.
    const key=positionKey(s.board,s.turn)+'|'+krk14ControlStateKey(token);
    if(stack.has(key))return fail('phase-position cycle',s);
    const historySignature=s.halfmove+'|'+s.history.join(';');
    const previouslySeen=seenStructural.get(key);
    if(previouslySeen){
      data.structuralRevisits++;
      if(!previouslySeen.has(historySignature))
        data.distinctHistoryRevisits++;
      previouslySeen.add(historySignature);
    }else{
      seenStructural.set(key,new Set([historySignature]));
      data.distinctStructuralStates++;
    }
    const o=outcome(s.board,s.turn,s.history,s.halfmove);
    if(o.kind!=='ongoing')return fail('terminal before strong action: '+o.kind,s);
    const choice=krkTaggedStrongChoice(s,token);
    if(!choice)return fail('missing source-derived continuation',s);
    data.sourceChoicesExamined++;
    const after=play(s,choice.move),a=outcome(after.board,after.turn,after.history,after.halfmove);
    moves.push(uci(choice.move));
    if(a.kind==='mate'){
      moves.pop();
      if(a.winner!==root.turn)return fail('wrong winner',after,choice.rule);
      data.terminalMates++;
      data.maximumPlies=Math.max(data.maximumPlies,ply+1);
      return null;
    }
    if(a.kind!=='ongoing'){
      const err=fail('terminal after strong action: '+a.kind,after,choice.rule);
      moves.pop();return err;
    }
    stack.add(key);
    const replies=legalMoves(after.board,after.turn);
    data.defenderRepliesExamined+=replies.length;
    data.maximumDefenderBranching=Math.max(
      data.maximumDefenderBranching,replies.length);
    for(const reply of replies){
      moves.push(uci(reply));
      if(reply.capture){
        const err=fail('defender rook capture',after,choice.rule);
        moves.pop();moves.pop();stack.delete(key);return err;
      }
      const child=play(after,reply);
      const err=visit(child,choice.continuationPhase,ply+2);
      moves.pop();
      if(err){moves.pop();stack.delete(key);return err;}
    }
    stack.delete(key);moves.pop();
    return null;
  }
  const error=visit(root,null,0);
  if(error)error.sourceTrace=annotateSourceTrace(root,error.variation);
  return {...data,ok:!error,firstCounterexample:error??null};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  // Known source-wall case, not a random position or answer lookup.
  const board=makeBoard();
  board[squareAt(2,1)]='wK';
  board[squareAt(0,2)]='wR';
  board[squareAt(5,3)]='bK';
  const root={board,turn:'w',material:'krk',halfmove:0,
    log:[],history:[positionKey(board,'w')]};
  const cap=process.argv.find(s=>s.startsWith('--nodes='));
  const maxNodes=cap?Number(cap.slice(8)):12000;
  console.log(JSON.stringify(auditKRK14MateTree(root,{maxNodes}),null,2));
  // In this deliberately non-strict diagnostic, a missing proof phase must
  // be visible in the result, not silently patched with an unproved move.
}

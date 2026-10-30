/**
 * KRK13 executable legal-root DIAGNOSTIC, never a move-selection data source.
 *
 * Stratified traversal of the 64^3 square triples (both rook colours),
 * comparing ACTUAL legal fresh strong-turn boards against the current
 * source-derived partial selector. --all enumerates the complete finite
 * geometric root space. Neither sample nor exhaustive successful JS checks
 * replace the global Lean finite mate proof / all-reply composition.
 */
import {makeBoard,validateSetup,positionKey,coords,outcome} from '../src/chess.js';
import {krkPartialRootChoice} from '../src/krk-nonwall-entry.js';
import {pathToFileURL} from 'node:url';

const LIMIT=64**3;
function fen(board,turn){
  const ranks=[];
  for(let y=7;y>=0;y--){
    let line='',empty=0;
    for(let x=0;x<8;x++){
      const p=board[y*8+x];
      if(!p){empty++;continue;}
      if(empty){line+=empty;empty=0;}
      line+=p[0]==='w'?p[1]:p[1].toLowerCase();
    }
    if(empty)line+=empty;
    ranks.push(line);
  }
  return ranks.join('/')+' '+turn+' - - 0 1';
}

/** Traversal permutation is coprime to 2^18; no repetition for --all. */
export function auditKRKLegalRootSelector({maxTriples=16384,maxExamples=12}={}){
  const total={triples:0,geometricallyLegal:0,ongoing:0,selected:0,uncovered:0};
  const phases={},examples=[];
  const max=Math.max(0,Math.min(LIMIT,Math.floor(maxTriples)));
  for(let j=0;j<max;j++){
    // Permuted source square triples distribute sampled roots over the board.
    const code=(j*4099+131)&(LIMIT-1);
    const sk=code&63,rs=(code>>6)&63,wk=(code>>12)&63;
    total.triples++;
    if(sk===wk||sk===rs||wk===rs)continue;
    for(const strong of ['w','b']){
      const weak=strong==='w'?'b':'w',board=makeBoard();
      board[sk]=strong+'K';board[rs]=strong+'R';board[wk]=weak+'K';
      if(validateSetup(board,'krk',strong)!==null)continue;
      total.geometricallyLegal++;
      const state={board,turn:strong,material:'krk',halfmove:0,log:[],
        history:[positionKey(board,strong)]};
      if(outcome(board,strong,state.history,0).kind!=='ongoing')continue;
      total.ongoing++;
      const choice=krkPartialRootChoice(state);
      if(choice?.kind==='step'){
        total.selected++;
        phases[choice.rootPhase]=(phases[choice.rootPhase]||0)+1;
      }else{
        total.uncovered++;
        if(examples.length<maxExamples)
          examples.push({fen:fen(board,strong),sk,rs,wk,
            squares:{sk:coords(sk),rs:coords(rs),wk:coords(wk)}});
      }
    }
  }
  return {scope:max===LIMIT?'complete-square-triple-enumeration':'stratified-sample',
    source:'KRK13 partial proof-derived selector, not a mate proof',
    total,phases,examples};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const all=process.argv.includes('--all');
  const specified=process.argv.find(a=>a.startsWith('--limit='));
  const maxTriples=all?LIMIT:specified?Number(specified.slice(8)):16384;
  const report=auditKRKLegalRootSelector({maxTriples});
  console.log(JSON.stringify(report,null,2));
  if(report.total.ongoing===0)process.exitCode=1;
  // --strict helps a later totality gate; default never pretends to be one.
  if(process.argv.includes('--strict')&&report.total.uncovered>0)process.exitCode=1;
}

/**
 * KRK14 falsification audit: do the FROZEN first actions actually hand off
 * after ALL observed legal defender replies? Also classify weak-to-move roots.
 *
 * The audit enumerates responses; the tagged move selector does not.
 * --all visits every triple in the 64^3 square space, both rook colours.
 * This is NOT a proof of arbitrarily long all-reply termination.
 */
import {pathToFileURL} from 'node:url';
import {
  makeBoard,legalMoves,opposite,outcome,play,positionKey,
  squareName,validateSetup
} from '../src/chess.js';
import {
  krkTaggedStrongChoice,classifyKRKWeakRoot
} from '../src/krk-tagged-strategy.js';

const TOTAL=64**3;
const uci=m=>m?squareName(m.from)+squareName(m.to):null;
function fen(b,turn){
  const rows=[];
  for(let y=7;y>=0;y--){
    let row='',spaces=0;
    for(let x=0;x<8;x++){
      const p=b[y*8+x];
      if(!p){spaces++;continue;}
      if(spaces){row+=spaces;spaces=0;}
      row+=p[0]==='w'?p[1]:p[1].toLowerCase();
    }
    if(spaces)row+=spaces;
    rows.push(row);
  }
  return rows.join('/')+' '+turn+' - - 0 1';
}
const state=(board,turn)=>({board,turn,material:'krk',halfmove:0,
  history:[positionKey(board,turn)],log:[]});

export function auditKRK14Continuations({
  maxTriples=2048,includeWeak=true,maxExamples=24
}={}){
  const n=Math.max(0,Math.min(TOTAL,Math.floor(maxTriples)));
  const totals={triples:0,strongRoots:0,selectedFirst:0,
    firstLegalReplies:0,firstHandoffs:0,
    secondLegalReplies:0,secondHandoffs:0,
    immediateMates:0,weakLegalRoots:0,weakMate:0,weakStalemate:0,
    weakWithRookCapture:0,weakSafeReplies:0,weakUnsupportedReplies:0};
  const phases={},failures={},examples=[];
  const fail=(reason,root,first,reply,after,other)=>{
    failures[reason]=(failures[reason]||0)+1;
    if(examples.length<maxExamples)examples.push({
      reason,rootFEN:fen(root.board,root.turn),
      firstMove:uci(first?.move),firstPhase:first?.rootPhase??null,
      sourceLemma:first?.rule??null,
      defendingMove:uci(reply),afterReplyFEN:after?fen(after.board,after.turn):null,
      ...other
    });
  };
  for(let j=0;j<n;j++){
    const code=(j*4099+131)&(TOTAL-1);
    const sk=code&63,rs=(code>>6)&63,wk=(code>>12)&63;
    totals.triples++;
    if(sk===rs||sk===wk||rs===wk)continue;
    for(const strong of ['w','b']){
      const weak=opposite(strong),board=makeBoard();
      board[sk]=strong+'K';board[rs]=strong+'R';board[wk]=weak+'K';
      if(validateSetup(board,'krk',strong)===null){
        const root=state(board,strong);
        if(outcome(board,strong,root.history,0).kind==='ongoing'){
          totals.strongRoots++;
          const first=krkTaggedStrongChoice(root);
          if(!first){
            fail('no-first-step',root,null,null,null);
          }else{
            totals.selectedFirst++;
            phases[first.rootPhase]=(phases[first.rootPhase]||0)+1;
            const a=play(root,first.move),o=outcome(a.board,a.turn,a.history,a.halfmove);
            if(o.kind==='mate'){
              totals.immediateMates++;
            }else if(o.kind!=='ongoing'){
              fail('first-terminal-'+o.kind,root,first,null,a);
            }else{
              for(const reply of legalMoves(a.board,a.turn)){
                totals.firstLegalReplies++;
                if(reply.capture){
                  fail('rook-capture-first',root,first,reply,a);
                  continue;
                }
                const child=play(a,reply);
                const second=krkTaggedStrongChoice(child,first.continuationPhase);
                if(!second){
                  fail('missing-first-handoff',root,first,reply,child);
                  continue;
                }
                totals.firstHandoffs++;
                const b=play(child,second.move);
                const result=outcome(b.board,b.turn,b.history,b.halfmove);
                if(result.kind==='mate'){
                  totals.immediateMates++;
                  continue;
                }
                if(result.kind!=='ongoing'){
                  fail('second-terminal-'+result.kind,root,first,reply,b,
                    {secondMove:uci(second.move),secondSource:second.rule});
                  continue;
                }
                for(const secondReply of legalMoves(b.board,b.turn)){
                  totals.secondLegalReplies++;
                  if(secondReply.capture){
                    fail('rook-capture-second',root,first,reply,b,
                      {secondMove:uci(second.move),secondReply:uci(secondReply)});
                    continue;
                  }
                  const leaf=play(b,secondReply);
                  const third=krkTaggedStrongChoice(leaf,second.continuationPhase);
                  if(third)totals.secondHandoffs++;
                  else fail('missing-second-handoff',root,first,reply,leaf,{
                    secondMove:uci(second.move),secondSource:second.rule,
                    secondReply:uci(secondReply)
                  });
                }
              }
            }
          }
        }
      }
      if(includeWeak&&validateSetup(board,'krk',weak)===null){
        const w=state(board,weak);
        const classification=classifyKRKWeakRoot(w,maxExamples);
        totals.weakLegalRoots++;
        if(classification.kind==='mate')totals.weakMate++;
        else if(classification.kind==='stalemate')totals.weakStalemate++;
        else if(classification.kind==='ongoing'){
          if(classification.hasImmediateKKDraw)totals.weakWithRookCapture++;
          totals.weakSafeReplies+=classification.safeReplies;
          totals.weakUnsupportedReplies+=classification.unsupportedSafeReplies;
          if(classification.unsupportedSafeReplies>0)
            fail('weak-safe-reply-uncovered',w,null,null,null,{
              unsupported:classification.unsupportedSafeReplies,
              witness:classification.examples[0]??null
            });
        }
      }
    }
  }
  return {scope:n===TOTAL?'exhaustive-square-triples':'stratified-prefix',
    source:'KRK14 actual legal replies, source-tagged moves; NOT a global finite Lean mate proof',
    totals,phases,failures,examples,
    completeMateProof:false,fideClockHistoryCertified:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const all=process.argv.includes('--all');
  const specified=process.argv.find(v=>v.startsWith('--limit='));
  const maxTriples=all?TOTAL:specified?Number(specified.slice(8)):2048;
  const report=auditKRK14Continuations({
    maxTriples,includeWeak:!process.argv.includes('--skip-weak')
  });
  console.log(JSON.stringify(report,null,2));
  if(!report.totals.strongRoots)process.exitCode=1;
  if(process.argv.includes('--strict')&&Object.values(report.failures)
    .some(n=>n>0))process.exitCode=1;
}

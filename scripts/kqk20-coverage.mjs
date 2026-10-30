/**
 * S020 bounded KQK diagnostic. Never used to choose live moves.
 * Samples legal fresh strong-turn KQK roots, checks every immediate lone-king
 * reply, and plays a separate first-reply demonstration set to termination.
 * A bounded sample is NOT an all-roots/all-defender proof.
 */
import {makeBoard,opposite,validateSetup,newGame,legalMoves,outcome} from '../src/chess.js';
import {chooseMathsOpponent,mathsPlayMove} from '../src/maths-play-policy.js';

const narg=(name,fallback)=>{
  const v=process.argv.find(x=>x.startsWith('--'+name+'='));
  const n=v===undefined?fallback:Number(v.split('=')[1]);
  if(!Number.isInteger(n)||n<1||n>30000)throw Error('Invalid --'+name);
  return n;
};
const attempts=narg('attempts',1600),gameLimit=narg('games',32),maxRounds=narg('rounds',110);
let seed=0x20c72365;
function next(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function fresh(strong){
  const sk=next()%64,q=next()%64,wk=next()%64,b=makeBoard();
  if(new Set([sk,q,wk]).size!==3)return null;
  b[sk]=strong+'K';b[q]=strong+'Q';b[wk]=opposite(strong)+'K';
  if(validateSetup(b,'kqk',strong)!==null)return null;
  return newGame(b,strong,'kqk',{experimentalKQK:true});
}
function runLine(root,strong){
  let s=root,token=null,round=0;
  const seen=new Set(),trace=[];
  const done=result=>({result,tail:trace.slice(-12)});
  while(round++<maxRounds){
    if(seen.has(s.history.at(-1)))return done('cycle');
    seen.add(s.history.at(-1));
    const c=chooseMathsOpponent(s,strong,token);
    if(!c?.move)return done('unsupported');
    trace.push(c.sourcePhase+':'+c.move.from+'-'+c.move.to);
    s=mathsPlayMove(s,c.move);
    const result=outcome(s.board,s.turn);
    if(result.kind==='mate')return done(result.winner===strong?'mate':'opponent-mate');
    if(result.kind!=='ongoing')return done(result.kind);
    const replies=legalMoves(s.board,opposite(strong));
    if(!replies.length)return done('terminal-without-mate');
    trace.push('weak:'+replies[0].from+'-'+replies[0].to);
    s=mathsPlayMove(s,replies[0]); // fixed *diagnostic* line, not live policy
    const after=outcome(s.board,s.turn);
    if(after.kind!=='ongoing')return done(after.kind);
    token=c.continuationToken;
  }
  return done('round-cap');
}
const report={diagnosticOnly:true,seed:'0x20c72365',attempts,legalRoots:0,
   selectableRoots:0,unavailableRoots:0,immediateNonmateTerminal:0,
   firstReplyPositions:0,firstReplyAnswered:0,firstReplyMissing:0,
   fullLineSamples:0,fullLineResults:{},samplePolicy:'fixed first legal weak reply',failureExamples:[]};
for(let i=0;i<attempts;i++){
  const strong=i%2?'b':'w',s=fresh(strong);
  if(!s)continue;
  report.legalRoots++;
  const c=chooseMathsOpponent(s,strong);
  if(!c?.move){report.unavailableRoots++;continue;}
  report.selectableRoots++;
  const after=mathsPlayMove(s,c.move),res=outcome(after.board,after.turn);
  if(res.kind!=='ongoing'&&res.kind!=='mate')report.immediateNonmateTerminal++;
  if(res.kind==='ongoing'){
    for(const reply of legalMoves(after.board,opposite(strong))){
      const child=mathsPlayMove(after,reply);
      report.firstReplyPositions++;
      const next=chooseMathsOpponent(child,strong,c.continuationToken);
      if(next?.move)report.firstReplyAnswered++;
      else report.firstReplyMissing++;
    }
  }
  if(report.fullLineSamples<gameLimit){
    const result=runLine(s,strong);
    report.fullLineSamples++;
    report.fullLineResults[result.result]=(report.fullLineResults[result.result]||0)+1;
    if(result.result!=='mate' && report.failureExamples.length<8)
      report.failureExamples.push({strong,king:s.board.indexOf(strong+'K'),
        queen:s.board.indexOf(strong+'Q'),weak:s.board.indexOf(opposite(strong)+'K'),...result});
  }
}
console.log(JSON.stringify(report,null,2));

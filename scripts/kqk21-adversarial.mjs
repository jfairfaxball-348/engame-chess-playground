/**
 * S021 KQK bounded all-defender falsification. DIAGNOSTIC ONLY.
 *
 * Enumerates EVERY legal defender response at every visited weak-turn node;
 * the adversarial search is NEVER imported by the live Maths controller.
 * Distinguishes checkmate from queen capture, stalemate, unsupported source
 * continuation, structural cycle and explicit resource caps. It intentionally
 * ignores FIDE claim/history clocks: this is the owner's temporary simplified
 * strategy audit, not certification of official chess rule parity.
 */
import {
  makeBoard, opposite, validateSetup, newGame, legalMoves,
  outcome, positionKey
} from '../src/chess.js';
import {chooseMathsOpponent, mathsPlayMove} from '../src/maths-play-policy.js';

function positiveArg(name, fallback, maximum=100000) {
  const item=process.argv.find(arg=>arg.startsWith('--'+name+'='));
  if(!item)return fallback;
  const n=Number(item.slice(name.length+3));
  if(!Number.isInteger(n)||n<1||n>maximum)
    throw Error('Invalid --'+name+' (1..'+maximum+')');
  return n;
}
const attempts=positiveArg('attempts',4000);
const perFamily=positiveArg('per-family',2,10);
const maxNodes=positiveArg('nodes',1200);
const maxRounds=positiveArg('rounds',48);
let seed=0x21c72365;
function random() {seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
function fresh(strong,turn) {
  const sk=random()%64,q=random()%64,wk=random()%64,board=makeBoard();
  if(new Set([sk,q,wk]).size!==3)return null;
  board[sk]=strong+'K';board[q]=strong+'Q';board[wk]=opposite(strong)+'K';
  if(validateSetup(board,'kqk',turn)!==null)return null;
  return newGame(board,turn,'kqk',{experimentalKQK:true});
}
const terminalKinds=['mate','opponent-mate','stalemate','queen-captured-draw',
  'unsupported','cycle','round-cap','node-cap','other-terminal'];
function terminal(kind,path) {return {kind,path};}
function shape(state,strong,token) {
  return positionKey(state.board,state.turn)+'|'+strong+'|'+
    (token?token.kind+':'+token.frame+':'+token.queen+':'+token.king+':'+token.weak:'none');
}
function visit(root,strong) {
  const tally=Object.fromEntries(terminalKinds.map(k=>[k,0]));
  let visited=0,defenderReplies=0,sourceChoices=0,firstFailure=null;
  const phases={};
  function walk(state,token,rounds,active,path) {
    if(visited>=maxNodes) {tally['node-cap']++;return false;}
    if(rounds>=maxRounds) {tally['round-cap']++;return false;}
    const key=shape(state,strong,token);
    if(active.has(key)) {
      tally.cycle++;
      if(!firstFailure)firstFailure=terminal('cycle',path);
      return false;
    }
    visited++;
    const now=outcome(state.board,state.turn); // clock-free on purpose
    if(now.kind==='mate') {
      const kind=now.winner===strong?'mate':'opponent-mate';
      tally[kind]++;
      if(kind!=='mate'&&!firstFailure)firstFailure=terminal(kind,path);
      return kind==='mate';
    }
    if(now.kind!=='ongoing') {
      const kind=now.kind==='stalemate'?'stalemate':'other-terminal';
      tally[kind]++;
      if(!firstFailure)firstFailure=terminal(kind,path);
      return false;
    }
    active.add(key);
    let allWin=true;
    if(state.turn===strong) {
      const c=chooseMathsOpponent(state,strong,token);
      if(!c?.move) {
        tally.unsupported++;allWin=false;
        if(!firstFailure)firstFailure=terminal('unsupported',path);
      } else {
        sourceChoices++;
        phases[c.sourcePhase]=(phases[c.sourcePhase]||0)+1;
        const child=mathsPlayMove(state,c.move);
        allWin=walk(child,c.continuationToken,rounds+1,active,
          path.concat('source:'+c.sourcePhase+':'+c.move.from+'-'+c.move.to));
      }
    } else {
      const moves=legalMoves(state.board,state.turn);
      defenderReplies+=moves.length;
      // Do not prune on a failure: preserve coverage counts, until a cap.
      for(const move of moves) {
        if(visited>=maxNodes) {
          tally['node-cap']++;allWin=false;break;
        }
        const child=mathsPlayMove(state,move);
        const nextPath=path.concat('defender:'+move.from+'-'+move.to);
        if(child.material==='kk') {
          tally['queen-captured-draw']++;allWin=false;
          if(!firstFailure)firstFailure=terminal('queen-captured-draw',nextPath);
          continue;
        }
        if(!walk(child,token,rounds,active,nextPath))allWin=false;
      }
    }
    active.delete(key);
    return allWin;
  }
  const guaranteed=walk(root,null,0,new Set(),[]);
  const capped=tally['node-cap']>0||tally['round-cap']>0;
  const hardFailure=['opponent-mate','stalemate','queen-captured-draw','unsupported','cycle','other-terminal']
    .some(k=>tally[k]>0);
  return {classification:hardFailure?'falsified':capped?'inconclusive':guaranteed?'all-replies-mate':'inconclusive',
    nodes:visited,defenderReplies,sourceChoices,tally,firstFailure,phases};
}

const picked=new Map(),samples=[],families={};
let legalCandidates=0;
for(let i=0;i<attempts;i++) {
  const strong=i%2===0?'w':'b',turn=i%5===0?opposite(strong):strong;
  const s=fresh(strong,turn);
  if(!s)continue;
  legalCandidates++;
  const first=turn===strong?chooseMathsOpponent(s,strong):null;
  const family=turn!==strong?'WeakToMove':first?.sourcePhase?.split('.')[1]||'UnsupportedAtRoot';
  const key=strong+':'+family;
  const existing=picked.get(key)||0;
  if(existing>=perFamily)continue;
  picked.set(key,existing+1);
  const verdict=visit(s,strong);
  const root={
    strong,turn,family,
    king:s.board.indexOf(strong+'K'),queen:s.board.indexOf(strong+'Q'),
    weak:s.board.indexOf(opposite(strong)+'K'),
    ...verdict
  };
  samples.push(root);
  if(!families[family])families[family]={roots:0,allRepliesMate:0,falsified:0,inconclusive:0};
  const group=families[family];
  group.roots++;
  if(verdict.classification==='all-replies-mate')group.allRepliesMate++;
  else group[verdict.classification]++;
}
const overall={diagnosticOnly:true,clockHistoryCertified:false,sourceSha:'c72365a8ba46f59114a2a77d9d38993f6a52df80',
  seed:'0x21c72365',attempts,perFamily,maxNodes,maxRounds,
  legalCandidates,roots:samples.length,
  allRepliesMate:samples.filter(s=>s.classification==='all-replies-mate').length,
  falsified:samples.filter(s=>s.classification==='falsified').length,
  inconclusive:samples.filter(s=>s.classification==='inconclusive').length,
  visitedNodes:samples.reduce((n,s)=>n+s.nodes,0),
  legalDefenderRepliesVisited:samples.reduce((n,s)=>n+s.defenderReplies,0),
  families,
  firstCounterexamples:samples.filter(s=>s.classification==='falsified').slice(0,12).map(
    ({strong,turn,family,king,queen,weak,firstFailure})=>
      ({strong,turn,family,king,queen,weak,...firstFailure})),
  firstInconclusive:samples.filter(s=>s.classification==='inconclusive').slice(0,8).map(
    ({strong,turn,family,king,queen,weak,tally})=>
      ({strong,turn,family,king,queen,weak,tally}))
};
console.log(JSON.stringify(overall,null,2));

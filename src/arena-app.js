import { Chess } from '/vendor/chess.js';
import { pieceSVG } from './pieces.js';
import { squareForCell } from './board-ui.js';
import { ENGINE_OPTIONS, engineById, parseBestmove, parseScore } from './arena-utils.js';

// Independent standard-chess spectator arena. Do not import the proof-gated
// endgame game's limited rules or opponent into this module.
const root=document.getElementById('engine-playground');
const maths=document.getElementById('app');
const mathsTab=document.getElementById('tab-maths');
const arenaTab=document.getElementById('tab-arena');
let game=new Chess(), white='lozza', black='stockfish';
let interval=1500, orientation='w', running=false, thinking=false, sequence=0, seen=null;
let sessions={w:null,b:null}, last=null, evaluation='', message='Ready to start.', turnCount=0;

class UciSession {
  constructor(spec){
    this.spec=spec; this.closed=false; this.pending=null;
    this.worker=new Worker(spec.url);
    this.ready=new Promise((resolve,reject)=>{this.resolveReady=resolve;this.rejectReady=reject;});
    this.startTimer=setTimeout(()=>this.fail(Error(spec.name+' did not initialise within 12 seconds.')),12000);
    this.worker.onmessage=event=>{
      for(const raw of String(event.data).split(/\r?\n/)){
        const line=raw.trim();
        if(line==='uciok'){this.worker.postMessage('isready');continue;}
        if(line==='readyok'){
          if(this.resolveReady){clearTimeout(this.startTimer);this.resolveReady();this.resolveReady=null;this.rejectReady=null;}
          continue;
        }
        if(this.pending&&line.startsWith('info ')&&line.includes(' score ')){
          this.pending.score=parseScore(line,this.pending.colour)||this.pending.score;
        }
        if(this.pending&&line.startsWith('bestmove ')){
          const task=this.pending;this.pending=null;clearTimeout(task.timeout);
          const move=parseBestmove(line);
          if(move)task.resolve({move,score:task.score});
          else task.reject(Error(this.spec.name+' returned an invalid move: '+line));
        }
      }
    };
    this.worker.onerror=event=>{event.preventDefault();this.fail(Error(spec.name+' worker failed to load. Check deployed engine files.'));};
    this.worker.postMessage('uci');
  }
  fail(error){
    clearTimeout(this.startTimer);
    if(this.rejectReady){this.rejectReady(error);this.resolveReady=null;this.rejectReady=null;}
    if(this.pending){const task=this.pending;this.pending=null;clearTimeout(task.timeout);task.reject(error);}
  }
  async search(fen,colour){
    await this.ready;
    if(this.closed)throw Error('Engine stopped');
    if(this.pending)throw Error('Engine already searching');
    return new Promise((resolve,reject)=>{
      const task={resolve,reject,colour,score:null,timeout:null};
      task.timeout=setTimeout(()=>this.fail(Error(this.spec.name+' exceeded the 20-second analysis limit.')),20000);
      this.pending=task;
      this.worker.postMessage('position fen '+fen);
      this.worker.postMessage(this.spec.search);
    });
  }
  close(){
    if(this.closed)return;this.closed=true;
    this.fail(Error('Engine stopped'));this.worker.terminate();
  }
}
function stop(){
  running=false;thinking=false;sequence++;
  for(const colour of ['w','b']){sessions[colour]?.close();sessions[colour]=null;}
}
function reset(){
  stop();game=new Chess();last=null;seen=null;evaluation='';turnCount=0;
  message='New game. Select the engines and press Play.';render();
}
function outcome(){
  if(game.isCheckmate())return 'Checkmate — '+(game.turn()==='w'?'Black':'White')+' wins';
  if(game.isStalemate())return 'Draw — stalemate';
  if(game.isThreefoldRepetition())return 'Draw — repetition';
  if(game.isInsufficientMaterial())return 'Draw — insufficient material';
  if(game.isDraw())return 'Draw — chess draw rule';
  return null;
}
async function moveOnce(epoch){
  if(outcome())return false;
  const colour=game.turn(), engine=engineById(colour==='w'?white:black);
  if(!engine)throw Error('Unknown engine');
  message=engine.name+' thinking for '+(colour==='w'?'White':'Black')+'…';render();
  if(!sessions[colour])sessions[colour]=new UciSession(engine);
  const result=await sessions[colour].search(game.fen(),colour);
  if(epoch!==sequence)return false;
  let played;
  try{played=game.move(result.move);}catch{played=null;}
  if(!played)throw Error(engine.name+' proposed an illegal move: '+JSON.stringify(result.move));
  last={from:played.from,to:played.to};
  seen=engine.name;evaluation=result.score===null?'':result.score;
  turnCount++;
  message=outcome()||('Last move: '+played.san+' · '+seen);
  render();
  return true;
}
async function playLoop(one=false){
  if(running||thinking)return;
  if(outcome()){message=outcome();render();return;}
  if(!one)running=true;
  thinking=true;
  const epoch=++sequence;render();
  try{
    do{
      const advanced=await moveOnce(epoch);
      if(!advanced||epoch!==sequence)break;
      if(one||outcome())break;
      await new Promise(resolve=>setTimeout(resolve,interval));
    }while(running&&epoch===sequence);
    if(epoch===sequence){running=false;thinking=false;message=outcome()||'Paused. Resume or play one move.';render();}
  }catch(error){
    if(epoch!==sequence)return;
    stop();message='Engine error: '+error.message;render();
  }
}
function pause(){
  if(!running&&!thinking)return;
  stop();message='Paused. Play resumes from this position.';render();
}
function boardMarkup(){
  const cells=[];
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const index=squareForCell(row,col,orientation);
    const file='abcdefgh'[index%8],rank=1+Math.floor(index/8);
    const p=game.get(file+rank),piece=p?p.color+p.type.toUpperCase():null;
    const isLight=((index%8)+Math.floor(index/8))%2===1;
    const recent=last&&(last.from===file+rank||last.to===file+rank);
    cells.push('<div class="arena-cell '+(isLight?'light':'dark')+(recent?' arena-recent':'')+'" role="img" aria-label="'+file+rank+' '+(p?(p.color==='w'?'White ':'Black ')+p.type.toUpperCase():'empty')+'">'+
      pieceSVG(piece)+(col===0?'<span class="ranklabel">'+rank+'</span>':'')+
      (row===7?'<span class="filelabel">'+file+'</span>':'')+'</div>');
  }
  return cells.join('');
}
function movesMarkup(){
  const hist=game.history(),lines=[];
  for(let i=0;i<hist.length;i+=2){
    lines.push('<div class="arena-move"><span>'+(i/2+1)+'.</span><strong>'+hist[i]+'</strong><strong>'+(hist[i+1]||'')+'</strong></div>');
  }
  return lines.join('')||'<p class="empty">Moves will appear here as the engines play.</p>';
}
function engineSelect(colour,chosen){
  return '<select id="arena-'+colour+'" aria-label="'+(colour==='w'?'White':'Black')+' engine" '+(turnCount||running?'disabled':'')+'>'+
    ENGINE_OPTIONS.map(x=>'<option value="'+x.id+'" '+(chosen===x.id?'selected':'')+'>'+x.name+'</option>').join('')+'</select>';
}
function render(){
  const ended=Boolean(outcome());
  root.innerHTML='<div class="shell arena-shell">'+
    '<header class="header"><div class="identity"><div class="mark">♞</div><div><div class="eyebrow">FULL CHESS · ENGINE VS ENGINE</div><h1>Engine <span>Playground</span></h1></div></div>'+
    '<span class="arena-runtime">Runs locally in your browser</span></header>'+
    '<div class="layout"><section class="board-column">'+
    '<div class="board-top"><span class="label">Engine match · '+turnCount+' plies</span><span class="status-dot" role="status">'+message+'</span></div>'+
    '<div class="board-frame"><div class="arena-grid" role="group" aria-label="Live chess game">'+boardMarkup()+'</div></div>'+
    '<div class="below-board"><span>White: '+engineById(white).name+'</span><span>Black: '+engineById(black).name+'</span></div>'+
    '</section><aside class="sidebar">'+
    '<div class="panel"><div class="section-head"><span class="label">Engine matchup</span></div>'+
    '<div class="fieldrow"><label for="arena-w">White</label>'+engineSelect('w',white)+'</div>'+
    '<div class="fieldrow"><label for="arena-b">Black</label>'+engineSelect('b',black)+'</div>'+
    '<p class="explain">Engine selection locks after the first move; Restart opens a new match.</p>'+
    '</div><div class="panel"><div class="section-head"><span class="label">Playback</span></div>'+
    '<button id="arena-play" class="main-action" '+(thinking||running||ended?'disabled':'')+'>▶ '+(turnCount?'Resume match':'Play match')+'</button>'+
    '<button id="arena-pause" class="secondary-action" '+(running||thinking?'':'disabled')+'>Ⅱ Pause</button>'+
    '<button id="arena-step" class="secondary-action" '+(thinking||running||ended?'disabled':'')+'>Next move →</button>'+
    '<button id="arena-reset" class="secondary-action">Restart match</button>'+
    '<button id="arena-flip" class="secondary-action">Flip board ↕</button>'+
    '<div class="fieldrow arena-speed"><label for="arena-pace">Time between moves</label>'+
    '<select id="arena-pace">'+[600,1500,3000,6000].map(ms=>'<option value="'+ms+'" '+(interval===ms?'selected':'')+'>'+(ms/1000)+'s</option>').join('')+'</select></div>'+
    '<p class="rules-note">Playback delay is separate from engine thinking time. Each engine searches in its own browser worker. Pause cancels active analysis safely.</p>'+
    '</div><div class="panel"><div class="section-head"><span class="label">Analysis</span></div>'+
    '<div class="engine-pill">'+(seen?'Last mover: '+seen:'Not started')+'</div>'+
    '<p class="explain">'+(evaluation?'Last engine score (White perspective): '+evaluation:'Evaluation available after a move, when reported by the engine.')+'</p>'+
    '<p class="explain">The first pair is Stockfish 19 Lite (not the full 94 MB build) and Lozza, a JavaScript UCI engine. Both can play either colour.</p>'+
    '</div><div class="panel history"><div class="section-head"><span class="label">Move history</span><span class="mini-tag">'+turnCount+' PLIES</span></div>'+
    '<div class="moves" aria-label="Engine match move history">'+movesMarkup()+'</div>'+
    (ended?'<p class="game-over">'+outcome()+'</p>':'')+'</div></aside></div>'+
    '<footer>Independent experimental engine arena · Standard chess rules provided by chess.js · No server-side compute · <a href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noopener noreferrer">Stockfish.js (GPL-3.0)</a> · <a href="https://github.com/op12no2/lozza" target="_blank" rel="noopener noreferrer">Lozza</a> · Proof-backed Maths Endgame remains isolated.</footer></div>';
}
root.addEventListener('click',event=>{
  const id=event.target.closest('button')?.id;
  if(id==='arena-play')playLoop();
  else if(id==='arena-pause')pause();
  else if(id==='arena-step')playLoop(true);
  else if(id==='arena-reset')reset();
  else if(id==='arena-flip'){orientation=orientation==='w'?'b':'w';render();}
});
root.addEventListener('change',event=>{
  const id=event.target?.id,val=event.target?.value;
  if(id==='arena-pace'){interval=Number(val);render();}
  if(id==='arena-w'&&turnCount===0&&!running){white=val;reset();}
  if(id==='arena-b'&&turnCount===0&&!running){black=val;reset();}
});
function tab(which){
  const arena=which==='arena';
  maths.hidden=arena;root.hidden=!arena;
  mathsTab.setAttribute('aria-selected',String(!arena));
  arenaTab.setAttribute('aria-selected',String(arena));
  mathsTab.tabIndex=arena?-1:0;arenaTab.tabIndex=arena?0:-1;
  if(!arena)pause();
}
mathsTab.addEventListener('click',()=>tab('maths'));
arenaTab.addEventListener('click',()=>tab('arena'));
document.getElementById('mode-tabs').addEventListener('keydown',event=>{
  if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
  event.preventDefault();
  const next=maths.hidden?'maths':'arena';
  tab(next);(next==='arena'?arenaTab:mathsTab).focus();
});
render();tab('maths');

import { Chess } from '/vendor/chess.js';
import { pieceSVG } from './pieces.js';
import { squareForCell, squareAtPoint } from './board-ui.js';
import { ENGINE_OPTIONS, engineById, parseBestmove, parseScore, captureSummary } from './arena-utils.js';

// Independent standard-chess spectator arena. Do not import the proof-gated
// endgame game's limited rules or opponent into this module.
const root=document.getElementById('engine-playground');
const maths=document.getElementById('app');
const mathsTab=document.getElementById('tab-maths');
const arenaTab=document.getElementById('tab-arena');
let game=new Chess(), white='lozza', black='stockfish';
let interval=1500, orientation='w', running=false, thinking=false, sequence=0, seen=null;
let sessions={w:null,b:null}, last=null, evaluation='', message='Ready to start.', turnCount=0;
let matchType='engines',playerSide='w',playerEngine='stockfish',started=true;
let selectedSquare=null,promotion=null,drag=null,suppressDragClick=false,focusSquare='e2';
const isPlayersTurn=()=>matchType==='human'&&started&&!thinking&&game.turn()===playerSide&&!outcome();


class UciSession {
  constructor(spec){
    this.spec=spec; this.closed=false; this.pending=null; this.lastMessages=[];
    this.worker=new Worker(spec.url);
    this.ready=new Promise((resolve,reject)=>{this.resolveReady=resolve;this.rejectReady=reject;});
    this.startTimer=setTimeout(()=>this.fail(Error(spec.name+' did not initialise within 12 seconds.')),12000);
    this.worker.onmessage=event=>{
      for(const raw of String(event.data).split(/\r?\n/)){
        const line=raw.trim();
        if(line){this.lastMessages.push(line.slice(0,150));if(this.lastMessages.length>8)this.lastMessages.shift();}
        if(line==='uciok'){
          // Lozza explicitly requires ucinewgame (or setoption Hash) before
          // accepting a position/search; Stockfish also supports this UCI step.
          this.worker.postMessage('ucinewgame');
          this.worker.postMessage('isready');
          continue;
        }
        if(line==='readyok'){
          if(this.resolveReady){clearTimeout(this.startTimer);this.resolveReady();this.resolveReady=null;this.rejectReady=null;}
          continue;
        }
        if(this.pending&&line.startsWith('info ')&&line.includes(' score ')){
          this.pending.score=parseScore(line,this.pending.colour)||this.pending.score;
        }
        if(this.pending&&line.startsWith('bestmove ')){
          const task=this.pending;this.pending=null;clearTimeout(task.timeout);
          clearTimeout(task.stopTimer);
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
    if(this.pending){const task=this.pending;this.pending=null;clearTimeout(task.timeout);clearTimeout(task.stopTimer);task.reject(error);}
  }
  async search(fen,colour){
    await this.ready;
    if(this.closed)throw Error('Engine stopped');
    if(this.pending)throw Error('Engine already searching');
    return new Promise((resolve,reject)=>{
      const task={resolve,reject,colour,score:null,timeout:null,stopTimer:null};
      // Engine commands are time-bounded. If an engine fails to return bestmove,
      // request a UCI stop and allow a short grace period before reporting failure.
      task.timeout=setTimeout(()=>{
        if(this.pending!==task)return;
        this.worker.postMessage('stop');
        task.stopTimer=setTimeout(()=>this.fail(Error(this.spec.name+' failed to return a move. Latest UCI: '+(this.lastMessages.slice(-3).join(' / ')||'none'))),3500);
      },8000);
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
  stop();game=new Chess();last=null;seen=null;evaluation='';turnCount=0;selectedSquare=null;promotion=null;drag=null;
  started=matchType==='engines';
  message=matchType==='human'?'Choose your colour and opponent, then Start game.':'New game. Select the engines and press Play.';render();
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
  const colour=game.turn(), engine=engineById(matchType==='human'?playerEngine:(colour==='w'?white:black));
  if(!engine)throw Error('Unknown engine');
  message=engine.name+' thinking for '+(colour==='w'?'White':'Black')+'…';render();
  if(!sessions[colour])sessions[colour]=new UciSession(engine);
  const result=await sessions[colour].search(game.fen(),colour);
  if(epoch!==sequence)return false;
  let played;
  try{played=game.move(result.move);}catch{played=null;}
  if(!played)throw Error(engine.name+' proposed an illegal move: '+JSON.stringify(result.move));
  last={from:played.from,to:played.to};selectedSquare=null;promotion=null;
  seen=engine.name;evaluation=result.score===null?'':result.score;
  turnCount=game.history().length;
  message=outcome()||(matchType==='human'?'Your turn · '+(playerSide==='w'?'White':'Black'):'Last move: '+played.san+' · '+seen);
  render();
  return true;
}
async function playLoop(one=false){
  if(matchType!=='engines'||running||thinking)return;
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

async function engineRespond(){
  if(matchType!=='human'||!started||outcome()||game.turn()===playerSide||thinking)return;
  thinking=true;const epoch=++sequence;render();
  try{
    await moveOnce(epoch);
    if(epoch===sequence){thinking=false;message=outcome()||'Your turn · '+(playerSide==='w'?'White':'Black');render();}
  }catch(error){
    if(epoch!==sequence)return;
    stop();message='Engine error: '+error.message;render();
  }
}
function startPlayerGame(){
  if(matchType!=='human'||started)return;
  started=true;message=playerSide==='w'?'Your turn · White':'Engine opening move…';render();
  if(playerSide==='b')void engineRespond();
}
function commitPlayerMove(move){
  if(!isPlayersTurn())return false;
  let done;try{done=game.move(move);}catch{done=null;}
  if(!done){message='Illegal move. Select a highlighted destination.';render();return false;}
  last={from:done.from,to:done.to};
  selectedSquare=null;promotion=null;seen='You';evaluation='';
  turnCount=game.history().length;
  message=outcome()||'Engine thinking…';render();
  if(!outcome())void engineRespond();
  return true;
}
function tryPlayerMove(from,to){
  if(!isPlayersTurn()||!from||!to)return false;
  const options=game.moves({square:from,verbose:true}).filter(m=>m.to===to);
  if(!options.length)return false;
  if(options.some(m=>m.promotion)){
    promotion={from,to,choices:options.map(m=>m.promotion).filter(Boolean)};
    message='Choose a promotion piece';render();return true;
  }
  return commitPlayerMove({from,to});
}
function clickPlayerSquare(square){
  if(!isPlayersTurn()||promotion)return;
  const piece=game.get(square);
  if(selectedSquare===square){selectedSquare=null;message='Selection cleared';render();return;}
  if(selectedSquare&&tryPlayerMove(selectedSquare,square))return;
  if(piece?.color===playerSide){
    selectedSquare=square;focusSquare=square;message='Choose a highlighted destination.';
  }else{selectedSquare=null;message='Select one of your pieces.';}
  render();
}
function undoPlayerTurn(){
  if(matchType!=='human'||!started||!game.history({verbose:true}).some(m=>m.color===playerSide))return;
  stop();
  if(game.history({verbose:true}).at(-1)?.color!==playerSide)game.undo();
  if(game.history({verbose:true}).at(-1)?.color===playerSide)game.undo();
  promotion=null;selectedSquare=null;
  const final=game.history({verbose:true}).at(-1);
  last=final?{from:final.from,to:final.to}:null;
  turnCount=game.history().length;seen=null;evaluation='';
  message='Last turn undone · Your turn.';render();
}
function playerBoardDestination(event){
  const board=root.querySelector('.arena-grid');
  if(!board)return null;
  const index=squareAtPoint(board.getBoundingClientRect(),event.clientX,event.clientY,orientation);
  return index<0?null:'abcdefgh'[index%8]+(1+Math.floor(index/8));
}
function boardMarkup(){
  const cells=[],active=isPlayersTurn()&&!promotion;
  const targets=active&&selectedSquare?new Set(game.moves({square:selectedSquare,verbose:true}).map(m=>m.to)):new Set();
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const index=squareForCell(row,col,orientation);
    const file='abcdefgh'[index%8],rank=1+Math.floor(index/8),square=file+rank;
    const p=game.get(square),piece=p?p.color+p.type.toUpperCase():null;
    const isLight=((index%8)+Math.floor(index/8))%2===1;
    const recent=last&&(last.from===square||last.to===square);
    const klass='arena-cell '+(isLight?'light':'dark')+(recent?' arena-recent':'')+
      (selectedSquare===square?' arena-selected':'')+(game.isCheck()&&p?.type==='k'&&p.color===game.turn()?' arena-check':'');
    const contents=pieceSVG(piece)+(targets.has(square)?'<span class="arena-legal '+(p?'arena-capture':'')+'"></span>':'')+
      (col===0?'<span class="ranklabel">'+rank+'</span>':'')+
      (row===7?'<span class="filelabel">'+file+'</span>':'');
    const label=square+' '+(p?(p.color==='w'?'White ':'Black ')+p.type:'empty');
    cells.push(matchType==='human'?
      '<button type="button" data-arena-square="'+square+'" tabindex="'+(square===focusSquare?0:-1)+'" class="'+klass+'" aria-label="'+label+'">'+contents+'</button>':
      '<div class="'+klass+'" role="img" aria-label="'+label+'">'+contents+'</div>');
  }
  return cells.join('');
}
function playerStrip(colour,captures){
  const spec=engineById(colour==='w'?white:black),detail=captures[colour];
  const pieces=detail.pieces.map(code=>
    '<span class="taken-piece" aria-label="'+(code[0]==='w'?'White ':'Black ')+({P:'pawn',N:'knight',B:'bishop',R:'rook',Q:'queen'})[code[1]]+'">'+pieceSVG(code)+'</span>'
  ).join('');
  return '<div class="arena-player-strip" aria-label="'+(colour==='w'?'White':'Black')+' player">'+
    '<div class="arena-player-name"><span class="arena-player-colour '+colour+'"></span><strong>'+(colour==='w'?'White':'Black')+'</strong><span class="arena-player-engine">'+spec.name+'</span></div>'+
    '<div class="arena-taken" aria-label="'+detail.pieces.length+' pieces captured">'+(pieces||'<span class="arena-no-taken">No captures</span>')+
    (detail.advantage>0?'<strong class="arena-advantage" aria-label="'+detail.advantage+' point material advantage">+'+detail.advantage+'</strong>':'')+'</div></div>';
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

function modeControls(){
  return '<div class="panel"><div class="section-head"><span class="label">Play mode</span></div>'+
    '<div class="fieldrow"><label for="arena-match">Match type</label><select id="arena-match">'+
    '<option value="engines" '+(matchType==='engines'?'selected':'')+'>Engine vs engine</option>'+
    '<option value="human" '+(matchType==='human'?'selected':'')+'>Play vs engine</option></select></div></div>';
}
function humanSettings(){
  return '<div class="section-head"><span class="label">Your game</span></div>'+
    '<div class="fieldrow"><label for="arena-human-colour">You play</label>'+
    '<select id="arena-human-colour" '+(started?'disabled':'')+'>'+
    '<option value="w" '+(playerSide==='w'?'selected':'')+'>White</option>'+
    '<option value="b" '+(playerSide==='b'?'selected':'')+'>Black</option></select></div>'+
    '<div class="fieldrow"><label for="arena-opponent">Opponent</label>'+
    '<select id="arena-opponent" '+(started?'disabled':'')+'>'+
    ENGINE_OPTIONS.map(e=>'<option value="'+e.id+'" '+(playerEngine===e.id?'selected':'')+'>'+e.name+'</option>').join('')+
    '</select></div><p class="explain">Choose either colour. Playing Black lets the engine make the opening move.</p>';
}
function humanPlayback(){
  return '<div class="section-head"><span class="label">Game controls</span></div>'+
    '<button id="arena-start-human" class="main-action" '+(started?'disabled':'')+'>Start game</button>'+
    '<button id="arena-undo" class="secondary-action" '+(!started||!game.history({verbose:true}).some(m=>m.color===playerSide)?'disabled':'')+'>Undo turn</button>'+
    '<button id="arena-reset" class="secondary-action">New game</button>'+
    '<button id="arena-flip" class="secondary-action">Flip board ↕</button>'+
    '<p class="rules-note">Tap a piece then a legal destination, or drag it. Castling, en passant, check and promotion follow standard rules.</p>';
}
function render(){
  const focused=root.contains(document.activeElement)?document.activeElement.closest?.('[data-arena-square]')?.dataset.arenaSquare:null;
  const ended=Boolean(outcome());
  const captured=captureSummary(game.history({verbose:true}));
  const upper=orientation==='w'?'b':'w',lower=orientation;
  root.innerHTML='<div class="shell arena-shell">'+
    '<header class="header"><div class="identity"><div class="mark">♞</div><div><div class="eyebrow">FULL CHESS · ENGINE VS ENGINE</div><h1>Engine <span>Playground</span></h1></div></div>'+
    '<span class="arena-runtime">Runs locally in your browser</span></header>'+
    '<div class="layout"><section class="board-column">'+
    '<div class="board-top"><span class="label">Engine match · '+turnCount+' plies</span><span class="status-dot" role="status">'+message+'</span></div>'+
    playerStrip(upper,captured)+
    '<div class="board-frame"><div class="arena-grid" role="group" aria-label="Live chess game">'+boardMarkup()+'</div></div>'+
    playerStrip(lower,captured)+
    '<div class="below-board"><span>Captured pieces are displayed beside each player</span><span>Standard chess · '+turnCount+' plies</span></div>'+
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
    '<p class="explain">Stockfish 19 Lite and Lozza are real UCI chess engines. Lozza now has a bounded search time to avoid indefinite calculations.</p>'+
    '</div><div class="panel history"><div class="section-head"><span class="label">Move history</span><span class="mini-tag">'+turnCount+' PLIES</span></div>'+
    '<div class="moves" aria-label="Engine match move history">'+movesMarkup()+'</div>'+
    (ended?'<p class="game-over">'+outcome()+'</p>':'')+'</div></aside></div>'+
    '<footer>Independent experimental engine arena · Standard chess rules provided by chess.js · No server-side compute · <a href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noopener noreferrer">Stockfish.js (GPL-3.0)</a> · <a href="https://github.com/op12no2/lozza" target="_blank" rel="noopener noreferrer">Lozza</a> · Proof-backed Maths Endgame remains isolated.</footer></div>';
  const panels=root.querySelectorAll('.sidebar > .panel');
  panels[0].insertAdjacentHTML('beforebegin',modeControls());
  if(matchType==='human'){
    panels[0].innerHTML=humanSettings();
    panels[1].innerHTML=humanPlayback();
    root.querySelector('.eyebrow').textContent='FULL CHESS · PLAY VS ENGINE';
    root.querySelector('.board-top .label').textContent='You vs Engine · '+turnCount+' plies';
    root.querySelector('.below-board span').textContent='Tap or drag pieces to make a move';
    root.querySelectorAll('.arena-player-strip').forEach(strip=>{
      const colour=strip.getAttribute('aria-label').startsWith('White')?'w':'b';
      strip.querySelector('.arena-player-engine').textContent=colour===playerSide?'You':engineById(playerEngine).name;
    });
    if(promotion){
      const chooser=document.createElement('div');chooser.className='arena-promotion';
      chooser.setAttribute('role','group');chooser.setAttribute('aria-label','Choose promotion piece');
      chooser.innerHTML='<strong>Promote to:</strong>'+promotion.choices.map(piece=>
        '<button type="button" data-arena-promotion="'+piece+'">'+({q:'Queen',r:'Rook',b:'Bishop',n:'Knight'})[piece]+'</button>').join('')+
        '<button type="button" id="arena-cancel-promotion">Cancel</button>';
      root.querySelector('.board-frame').after(chooser);
    }
  }
  if(focused)root.querySelector('[data-arena-square="'+focused+'"]')?.focus({preventScroll:true});
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

root.addEventListener('click',event=>{
  const option=event.target.closest('[data-arena-promotion]');
  if(option&&promotion){
    commitPlayerMove({from:promotion.from,to:promotion.to,promotion:option.dataset.arenaPromotion});return;
  }
  if(event.target.closest('#arena-cancel-promotion')){
    promotion=null;message='Promotion cancelled. Choose a destination.';render();return;
  }
  const square=event.target.closest('[data-arena-square]');
  if(square){
    if(suppressDragClick&&event.detail!==0){suppressDragClick=false;return;}
    clickPlayerSquare(square.dataset.arenaSquare);return;
  }
  if(event.target.closest('#arena-start-human'))startPlayerGame();
  if(event.target.closest('#arena-undo'))undoPlayerTurn();
});
root.addEventListener('change',event=>{
  const {id,value}=event.target;
  if(id==='arena-match'&&['human','engines'].includes(value)){
    matchType=value;orientation=value==='human'?playerSide:'w';
    focusSquare=playerSide==='w'?'e2':'e7';reset();
  }
  if(id==='arena-human-colour'&&matchType==='human'&&!started){
    playerSide=value;orientation=value;focusSquare=value==='w'?'e2':'e7';reset();
  }
  if(id==='arena-opponent'&&matchType==='human'&&!started&&engineById(value)){playerEngine=value;reset();}
});
// The original Engine-vs-Engine handlers remain intact; human-only board
// events run through chess.js so no partial legality logic is duplicated.
root.addEventListener('pointerdown',event=>{
  if(!isPlayersTurn()||promotion||!event.isPrimary||event.button!==0)return;
  suppressDragClick=false;
  const el=event.target.closest('[data-arena-square]');
  const from=el?.dataset.arenaSquare, piece=from?game.get(from):null;
  if(!piece||piece.color!==playerSide)return;
  drag={id:event.pointerId,from,x:event.clientX,y:event.clientY,moved:false,node:el};
  try{el.setPointerCapture(event.pointerId);}catch{}
});
root.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>=7){
    drag.moved=true;drag.node.classList.add('arena-drag-source');
  }
});
root.addEventListener('pointerup',event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const {from,moved,node}=drag;drag=null;
  try{node.releasePointerCapture(event.pointerId);}catch{}
  node.classList.remove('arena-drag-source');
  if(!moved)return;
  suppressDragClick=true;
  const to=playerBoardDestination(event);
  if(!to||!tryPlayerMove(from,to)){selectedSquare=null;message='Illegal drop — move cancelled.';render();}
});
root.addEventListener('pointercancel',event=>{
  if(drag&&drag.id===event.pointerId){drag.node.classList.remove('arena-drag-source');drag=null;suppressDragClick=false;}
});
root.addEventListener('focusin',event=>{
  const el=event.target.closest?.('[data-arena-square]');
  if(el)focusSquare=el.dataset.arenaSquare;
});
root.addEventListener('keydown',event=>{
  const el=event.target.closest?.('[data-arena-square]');
  if(!el)return;
  if(event.key==='Escape'){
    if(selectedSquare){selectedSquare=null;message='Selection cleared';render();}
    return;
  }
  const diff={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[event.key];
  if(!diff)return;
  event.preventDefault();
  const square=el.dataset.arenaSquare;
  const file='abcdefgh'.indexOf(square[0]),rank=Number(square[1])-1;
  const row=orientation==='w'?7-rank:rank,col=orientation==='w'?file:7-file;
  const nr=Math.max(0,Math.min(7,row+diff[0])),nc=Math.max(0,Math.min(7,col+diff[1]));
  const index=squareForCell(nr,nc,orientation);
  focusSquare='abcdefgh'[index%8]+(1+Math.floor(index/8));
  root.querySelector('[data-arena-square="'+focusSquare+'"]')?.focus({preventScroll:true});
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

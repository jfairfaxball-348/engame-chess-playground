import { MATERIAL, initialSetup, validateSetup, legalMoves, newGame, play, outcome, squareName, opposite, inCheck } from './chess.js';
import { chooseDecision, strategyLabel } from './engine.js';
import { pieceSVG, pieceLabel } from './pieces.js';
import { squareForCell, squareAtPoint } from './board-ui.js';

const CLASS_DESCRIPTION={
  kk:'Neither king can deliver checkmate. Arbitrary legal movement preserves that fact.',
  kbk:'A lone bishop and king cannot produce checkmate. Losing the bishop leaves K vs K.',
  knk:'A checking knight cannot cover the orthogonal escapes of the defending king.',
  krk:'Not released here. Wait until endgame-chess finishes, verifies, freezes and approves the full relevant playing strategy.'
};
const root=document.getElementById('app');
let material='kk',human='w',toMove='w',setup=initialSetup(material),mode='editor';
let active='wK',selected=null,game=null,notice='',busy=false,timeoutId=null,engineNote='',lastMove=null;
let gesture=null,ignoreClickUntil=0;
const activeExtra=()=>MATERIAL[material].extra;
const colorName=c=>c==='w'?'White':'Black';
function clearPending(){if(timeoutId!==null)clearTimeout(timeoutId);timeoutId=null;busy=false;}
function startEditor(){clearPending();mode='editor';game=null;selected=null;lastMove=null;notice='';engineNote='';render();}
function setMaterial(id){if(!MATERIAL[id]?.playable)return;clearPending();material=id;setup=initialSetup(material);toMove='w';active='wK';mode='editor';game=null;selected=null;lastMove=null;notice='';engineNote='';render();}
function placePiece(square){
  if(active==='erase')setup[square]=null;
  else {
    if(active[1]==='K'){
      for(let i=0;i<64;i++)if(setup[i]===active)setup[i]=null;
    }
    if(active[1]!=='K')for(let i=0;i<64;i++)if(setup[i] && setup[i][1]!=='K')setup[i]=null;
    setup[square]=active;
  }
  selected=null;notice='';render();
}
function launch(){
  if(!MATERIAL[material]?.playable){notice='Material not yet released for playground play.';render();return;}
  const error=validateSetup(setup,material,toMove);
  if(error){notice=error;render();return;}
  try{game=newGame(setup,toMove,material);}catch(e){notice=e.message;render();return;}
  mode='playing';selected=null;lastMove=null;notice='';engineNote='';render();queueComputer();
}
function queueComputer(){
  if(mode!=='playing'||!game||game.turn===human||outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing')return;
  busy=true;render();
  timeoutId=setTimeout(()=>{
    timeoutId=null;
    const decision=chooseDecision(game,opposite(human));
    busy=false;
    if(decision?.move){
      lastMove={from:decision.move.from,to:decision.move.to};
      game=play(game,decision.move);
      engineNote=decision.rule+' · '+decision.reason+' [frozen dead-position result; demonstration move]';
    }
    selected=null;render();
  },340);
}
function commitMove(from,to){
  if(mode!=='playing'||!game||busy||game.turn!==human)return false;
  if(outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing')return false;
  const candidate=legalMoves(game.board,human).find(m=>m.from===from&&m.to===to);
  if(!candidate)return false;
  game=play(game,candidate);
  lastMove={from,to};
  selected=null;notice='';render();queueComputer();
  return true;
}
function relocatePiece(from,to){
  if(from===to){render();return;}
  if(to<0){notice='Drop inside the board to place the piece.';render();return;}
  const piece=setup[from];if(!piece)return;
  setup=setup.slice();setup[from]=null;setup[to]=piece;
  active=piece;selected=null;notice='';render();
}
function interact(square){
  if(mode==='editor'){placePiece(square);return;}
  if(!game||busy||game.turn!==human||outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing')return;
  const piece=game.board[square];
  if(selected===null){
    if(piece?.[0]===human){selected=square;notice='';render();}
    else{notice='Select one of your pieces.';render();}
    return;
  }
  if(selected===square){selected=null;notice='';render();return;}
  if(commitMove(selected,square))return;
  if(piece?.[0]===human){selected=square;notice='';render();return;}
  selected=null;notice='That is not a legal move.';render();
}
function clearGesture(){
  if(!gesture)return;
  if(gesture.node?.hasPointerCapture?.(gesture.pointerId)){
    try{gesture.node.releasePointerCapture(gesture.pointerId);}catch{}
  }
  gesture.ghost?.remove();gesture=null;
  root.querySelectorAll('.drag-legal,.drag-source,.drop-target').forEach(node=>node.classList.remove('drag-legal','drag-source','drop-target'));
}
function pointerDown(event){
  if(!event.isPrimary||event.button!==0||gesture)return;
  const node=event.target.closest('[data-sq]');
  if(!node||!root.contains(node))return;
  const from=Number(node.dataset.sq),piece=(mode==='editor'?setup:game?.board)?.[from];
  if(!piece)return;
  if(mode==='playing'&&(!game||busy||game.turn!==human||piece[0]!==human||
    outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing'))return;
  gesture={pointerId:event.pointerId,node,from,piece,x:event.clientX,y:event.clientY,dragged:false,ghost:null};
  try{node.setPointerCapture(event.pointerId);}catch{}
}
function pointerMove(event){
  const g=gesture;
  if(!g||event.pointerId!==g.pointerId)return;
  if(!g.dragged&&Math.hypot(event.clientX-g.x,event.clientY-g.y)<7)return;
  if(!g.dragged){
    g.dragged=true;g.node.classList.add('drag-source');
    if(mode==='playing'){
      const targets=new Set(legalMoves(game.board,human).filter(m=>m.from===g.from).map(m=>m.to));
      root.querySelectorAll('[data-sq]').forEach(node=>{if(targets.has(Number(node.dataset.sq)))node.classList.add('drag-legal');});
    }
    g.ghost=document.createElement('div');g.ghost.className='drag-ghost';
    g.ghost.innerHTML=pieceSVG(g.piece);document.body.append(g.ghost);
  }
  g.ghost.style.left=event.clientX+'px';g.ghost.style.top=event.clientY+'px';
  const board=root.querySelector('.chessboard');
  const target=board?squareAtPoint(board.getBoundingClientRect(),event.clientX,event.clientY,human):-1;
  root.querySelectorAll('.drop-target').forEach(node=>node.classList.remove('drop-target'));
  if(target>=0)root.querySelector('[data-sq="'+target+'"]')?.classList.add('drop-target');
}
function pointerUp(event){
  const g=gesture;if(!g||event.pointerId!==g.pointerId)return;
  const dragged=g.dragged,from=g.from,board=root.querySelector('.chessboard');
  const to=board?squareAtPoint(board.getBoundingClientRect(),event.clientX,event.clientY,human):-1;
  clearGesture();
  if(!dragged)return; // Native click handles both tap and keyboard activation.
  ignoreClickUntil=Date.now()+350;
  if(mode==='editor'){relocatePiece(from,to);return;}
  if(!commitMove(from,to)){selected=null;notice='Illegal drop — piece returned to its square.';render();}
}
function pointerCancel(event){
  if(gesture&&event.pointerId===gesture.pointerId){
    const dragged=gesture.dragged;clearGesture();
    if(dragged){ignoreClickUntil=Date.now()+350;render();}
  }
}
function status(){
  if(mode==='editor')return 'Position editor';
  const result=outcome(game.board,game.turn,game.history,game.halfmove);
  if(result.kind==='mate')return `Checkmate · ${colorName(result.winner)} wins`;
  if(result.kind==='stalemate')return 'Stalemate · Draw';
  if(result.kind==='75-move')return '75-move rule · Draw';
  if(result.kind==='fivefold')return 'Fivefold repetition · Draw';
  if(busy)return 'Opponent to move…';
  if(inCheck(game.board,game.turn))return `${colorName(game.turn)} in check · ${game.turn===human?'Your turn':'Opponent turn'}`;
  return `${colorName(game.turn)} to move${game.turn===human?' · Your turn':' · Engine turn'}`;
}
function boardMarkup(){
  const b=mode==='editor'?setup:game.board;
  const legal=mode==='playing'&&selected!==null&&game.turn===human&&!busy?
    new Set(legalMoves(game.board,human).filter(m=>m.from===selected).map(m=>m.to)):new Set();
  const cells=[];
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const sq=squareForCell(row,col,human);
    const [file,rank]=[sq%8,Math.floor(sq/8)];
    const p=b[sq],isLight=(file+rank)%2===1;
    const check=mode==='playing'&&p===`${game.turn}K`&&inCheck(game.board,game.turn);
    const recent=lastMove&&(lastMove.from===sq?'last-from':lastMove.to===sq?'last-to':'');
    cells.push(`<button type="button" class="sq ${isLight?'light':'dark'} ${selected===sq?'selected':''} ${recent||''} ${check?'in-check':''}" data-sq="${sq}" aria-pressed="${selected===sq}" aria-label="${squareName(sq)} ${pieceLabel(p)}${legal.has(sq)?', legal destination':''}">
      ${pieceSVG(p)}
      ${legal.has(sq)?`<span class="hint ${p?'capture-hint':''}"></span>`:''}
      ${col===0?`<span class="ranklabel">${rank+1}</span>`:''}
      ${row===7?`<span class="filelabel">${'abcdefgh'[file]}</span>`:''}</button>`);
  }
  return cells.join('');
}
function render(){
  const extra=activeExtra(),error=validateSetup(setup,material,toMove);
  const palette=['wK','bK',...(extra?[`w${extra}`,`b${extra}`]:[]),'erase'];
  const gameOver=mode==='playing'&&outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing';
  root.innerHTML=`<div class="shell">
    <header class="header"><div class="identity"><div class="mark">◆</div><div><div class="eyebrow">PROVEN ENDGAMES · PLAYABLE</div><h1>Endgame <span>Playground</span></h1></div></div><a href="https://github.com/jfairfaxball-348/engame-chess-playground" target="_blank" rel="noopener noreferrer" class="source-link">Source code ↗</a></header>
    <div class="layout">
      <section class="board-column">
        <div class="board-top"><span class="label">${mode==='editor'?'Arrange a position':'Your board'}</span><span class="status-dot">${status()}</span></div>
        <div class="board-frame"><div class="chessboard" role="group" aria-label="Chessboard">${boardMarkup()}</div></div>
        <div class="below-board"><span>${mode==='editor'?'Choose a piece to place. Drag a piece to reposition it.':'Tap to move or drag a piece. Dots mark legal moves.'}</span><span>${mode==='playing'?`Ply ${game.log.length} · Halfmoves ${game.halfmove}`:'8 × 8 · Chess'}</span></div>
      </section>
      <aside class="sidebar">
        <div class="panel"><div class="section-head"><span class="label">Material</span></div>
          <div class="class-grid">${Object.entries(MATERIAL).map(([id,d])=>`<button class="class-option ${material===id?'on':''}" data-class="${id}" ${d.playable?'':'disabled aria-disabled="true" title="Awaiting complete release from endgame-chess"'}>${d.label}${d.playable?'':' · Coming later'}</button>`).join('')}</div>
          <div class="theorem"><span class="small">${MATERIAL[material].theorem}</span><strong>${MATERIAL[material].outcome}</strong><p>${CLASS_DESCRIPTION[material]}</p></div>
        </div>
        <div class="panel"><div class="section-head"><span class="label">Game setup</span></div>
          <div class="fieldrow"><label for="player">You play</label><select id="player" ${mode==='playing'?'disabled':''}><option value="w" ${human==='w'?'selected':''}>White</option><option value="b" ${human==='b'?'selected':''}>Black</option></select></div>
          <div class="fieldrow"><label for="turn">First to move</label><select id="turn" ${mode==='playing'?'disabled':''}><option value="w" ${toMove==='w'?'selected':''}>White</option><option value="b" ${toMove==='b'?'selected':''}>Black</option></select></div>
          ${mode==='editor'?`<div class="palette">${palette.map(p=>`<button data-piece="${p}" class="palettepiece ${active===p?'on':''}" title="${p==='erase'?'Erase piece':(p[0]==='w'?'White ':'Black ')+({K:'king',B:'bishop',N:'knight',R:'rook'}[p[1]])}">${p==='erase'?'⌫':pieceSVG(p)}</button>`).join('')}</div>`:''}
          ${mode==='editor'?`<button class="main-action" id="start">Start game →</button><button class="secondary-action" id="reset">Reset arrangement</button>`:`<button class="secondary-action" id="edit">Edit / new game</button>`}
          ${mode==='editor'&&error?`<p class="validation">${error}</p>`:''}
          ${notice?`<p class="validation">${notice}</p>`:''}
        </div>
        <div class="panel"><div class="section-head"><span class="label">Opponent</span></div>
          <div class="engine-pill">${strategyLabel(material)}</div>
          <p class="explain">The opponent uses arbitrary legal moves in released, proved dead-position classes; it does not use a third-party chess engine.</p>
          ${mode==='playing'&&engineNote?`<p class="engine-explanation"><strong>Last engine decision:</strong> ${engineNote}</p>`:''}
          <p class="rules-note">Exploration mode permits moves after a theoretical dead-position draw. KRK remains locked until its upstream strategy is finished and you approve it.</p>
        </div>
        <div class="panel history"><div class="section-head"><span class="label">Moves</span><span class="mini-tag">${mode==='playing'?game.log.length:0} PLIES</span></div>
        <div class="moves">${mode==='playing'&&game.log.length?game.log.map((line,i)=>`<div class="move-row"><span>${i+1}</span><span>${line}</span></div>`).join(''):'<p class="empty">Moves appear here after starting.</p>'}</div>
        ${gameOver?`<p class="game-over">${status()}</p>`:''}</div>
      </aside>
    </div><footer>Independent implementation · No tablebases, external chess engine, runtime GitHub calls or API keys · <a href="https://github.com/jfairfaxball-348/engame-chess" target="_blank" rel="noopener noreferrer">Parent research</a> is never modified</footer>
  </div>`;

  root.querySelectorAll('[data-class]').forEach(node=>node.addEventListener('click',()=>setMaterial(node.dataset.class)));
  root.querySelectorAll('[data-piece]').forEach(node=>node.addEventListener('click',()=>{active=node.dataset.piece;render();}));
  root.querySelector('#player')?.addEventListener('change',e=>{human=e.target.value;render();});
  root.querySelector('#turn')?.addEventListener('change',e=>{toMove=e.target.value;render();});
  root.querySelector('#start')?.addEventListener('click',launch);
  root.querySelector('#reset')?.addEventListener('click',()=>setMaterial(material));
  root.querySelector('#edit')?.addEventListener('click',startEditor);
}
// Delegated events survive board rerenders; both inputs call commitMove()/play().
root.addEventListener('click',event=>{
  const node=event.target.closest('[data-sq]');
  if(!node||!root.contains(node))return;
  if(Date.now()<ignoreClickUntil){event.preventDefault();return;}
  interact(Number(node.dataset.sq));
  if(event.detail===0)root.querySelector('[data-sq="'+node.dataset.sq+'"]')?.focus({preventScroll:true});
});
root.addEventListener('pointerdown',pointerDown);
root.addEventListener('pointermove',pointerMove);
root.addEventListener('pointerup',pointerUp);
root.addEventListener('pointercancel',pointerCancel);
render();

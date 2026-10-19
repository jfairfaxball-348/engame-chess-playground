import { MATERIAL, initialSetup, validateSetup, legalMoves, newGame, play, outcome, squareName, opposite } from './chess.js';
import { chooseDecision, strategyLabel } from './engine.js';

const PIECES={wK:'♔',bK:'♚',wB:'♗',bB:'♝',wN:'♘',bN:'♞',wR:'♖',bR:'♜'};
const CLASS_DESCRIPTION={
  kk:'Neither king can deliver checkmate. Arbitrary legal movement preserves that fact.',
  kbk:'A lone bishop and king cannot produce checkmate. Losing the bishop leaves K vs K.',
  knk:'A checking knight cannot cover the orthogonal escapes of the defending king.',
  krk:'Not released here. Wait until endgame-chess finishes, verifies, freezes and approves the full relevant playing strategy.'
};
const root=document.getElementById('app');
let material='kk',human='w',toMove='w',setup=initialSetup(material),mode='editor';
let active='wK',selected=null,game=null,notice='',busy=false,timeoutId=null,engineNote='';
const activeExtra=()=>MATERIAL[material].extra;
const colorName=c=>c==='w'?'White':'Black';
function clearPending(){if(timeoutId!==null)clearTimeout(timeoutId);timeoutId=null;busy=false;}
function startEditor(){clearPending();mode='editor';game=null;selected=null;notice='';engineNote='';render();}
function setMaterial(id){if(!MATERIAL[id]?.playable)return;clearPending();material=id;setup=initialSetup(material);toMove='w';active='wK';mode='editor';game=null;selected=null;notice='';engineNote='';render();}
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
  mode='playing';selected=null;notice='';engineNote='';render();queueComputer();
}
function queueComputer(){
  if(mode!=='playing'||!game||game.turn===human||outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing')return;
  busy=true;render();
  timeoutId=setTimeout(()=>{
    timeoutId=null;
    const decision=chooseDecision(game,opposite(human));
    busy=false;
    if(decision?.move){
      game=play(game,decision.move);
      engineNote=decision.rule+' · '+decision.reason+' [frozen dead-position result; demonstration move]';
    }
    selected=null;render();
  },340);
}
function interact(square){
  if(mode==='editor'){placePiece(square);return;}
  if(!game||busy||game.turn!==human||outcome(game.board,game.turn,game.history,game.halfmove).kind!=='ongoing')return;
  const piece=game.board[square];
  if(selected===null){if(piece?.[0]===human){selected=square;render();}return;}
  if(selected===square){selected=null;render();return;}
  const move=legalMoves(game.board,game.turn).find(m=>m.from===selected&&m.to===square);
  if(move){game=play(game,move);selected=null;notice='';render();queueComputer();return;}
  if(piece?.[0]===human){selected=square;render();return;}
  selected=null;notice='That is not a legal move.';render();
}
function status(){
  if(mode==='editor')return 'Position editor';
  const result=outcome(game.board,game.turn,game.history,game.halfmove);
  if(result.kind==='mate')return `Checkmate · ${colorName(result.winner)} wins`;
  if(result.kind==='stalemate')return 'Stalemate · Draw';
  if(result.kind==='75-move')return '75-move rule · Draw';
  if(result.kind==='fivefold')return 'Fivefold repetition · Draw';
  if(busy)return 'Engine considering a reply…';
  return `${colorName(game.turn)} to move${game.turn===human?' · Your turn':' · Engine turn'}`;
}
function boardMarkup(){
  const b=mode==='editor'?setup:game.board;
  const legal=mode==='playing'&&selected!==null&&game.turn===human&&!busy?
    new Set(legalMoves(game.board,human).filter(m=>m.from===selected).map(m=>m.to)):new Set();
  const cells=[];
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const sq=human==='w'?(7-row)*8+col:row*8+(7-col);
    const [file,rank]=[sq%8,Math.floor(sq/8)];
    const p=b[sq],isLight=(file+rank)%2===1;
    cells.push(`<button type="button" class="sq ${isLight?'light':'dark'} ${selected===sq?'selected':''}" data-sq="${sq}" aria-label="${squareName(sq)}${p?' '+(p[0]==='w'?'white ':'black ')+({K:'king',B:'bishop',N:'knight',R:'rook'}[p[1]]):' empty'}">
      ${p?`<span class="piece ${p[0]==='w'?'whitepiece':'blackpiece'}">${PIECES[p]}</span>`:''}
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
    <header class="header"><div class="identity"><div class="mark">♜</div><div><div class="eyebrow">INDEPENDENT RESEARCH SIDE PROJECT</div><h1>Endgame Chess <span>Playground</span></h1></div></div><a href="https://github.com/jfairfaxball-348/engame-chess-playground" target="_blank" rel="noopener noreferrer" class="source-link">Source code ↗</a></header>
    <div class="layout">
      <section class="board-column">
        <div class="board-top"><span class="label">${mode==='editor'?'ARRANGE A POSITION':'CHALLENGE THE ENGINE'}</span><span class="status-dot">${status()}</span></div>
        <div class="board-frame"><div class="chessboard" role="group" aria-label="Chessboard">${boardMarkup()}</div></div>
        <div class="below-board"><span>${mode==='editor'?'Click a piece below, then click its square. Click Erase to remove.':'Click your piece, then its destination. Dots show legal moves.'}</span><span>${mode==='playing'?`Ply ${game.log.length} · Halfmoves ${game.halfmove}`:'8 × 8 · Chess'}</span></div>
      </section>
      <aside class="sidebar">
        <div class="panel"><div class="section-head"><span class="label">01 / MATERIAL CLASS</span><span class="mini-tag">LOCAL PROOF REFERENCE</span></div>
          <div class="class-grid">${Object.entries(MATERIAL).map(([id,d])=>`<button class="class-option ${material===id?'on':''}" data-class="${id}" ${d.playable?'':'disabled aria-disabled="true" title="Awaiting complete release from endgame-chess"'}>${d.label}${d.playable?'':' · Coming later'}</button>`).join('')}</div>
          <div class="theorem"><span class="small">${MATERIAL[material].theorem}</span><strong>${MATERIAL[material].outcome}</strong><p>${CLASS_DESCRIPTION[material]}</p></div>
        </div>
        <div class="panel"><div class="section-head"><span class="label">02 / SET UP THE MATCH</span></div>
          <div class="fieldrow"><label for="player">You play</label><select id="player" ${mode==='playing'?'disabled':''}><option value="w" ${human==='w'?'selected':''}>White</option><option value="b" ${human==='b'?'selected':''}>Black</option></select></div>
          <div class="fieldrow"><label for="turn">First to move</label><select id="turn" ${mode==='playing'?'disabled':''}><option value="w" ${toMove==='w'?'selected':''}>White</option><option value="b" ${toMove==='b'?'selected':''}>Black</option></select></div>
          ${mode==='editor'?`<div class="palette">${palette.map(p=>`<button data-piece="${p}" class="palettepiece ${active===p?'on':''}" title="${p==='erase'?'Erase piece':(p[0]==='w'?'White ':'Black ')+({K:'king',B:'bishop',N:'knight',R:'rook'}[p[1]])}">${p==='erase'?'⌫':PIECES[p]}</button>`).join('')}</div>`:''}
          ${mode==='editor'?`<button class="main-action" id="start">Start playing →</button><button class="secondary-action" id="reset">Reset arrangement</button>`:`<button class="secondary-action" id="edit">← Edit position / new game</button>`}
          ${mode==='editor'&&error?`<p class="validation">${error}</p>`:''}
          ${notice?`<p class="validation">${notice}</p>`:''}
        </div>
        <div class="panel"><div class="section-head"><span class="label">03 / ENGINE & RULES</span></div>
          <div class="engine-pill">${strategyLabel(material)}</div>
          <p class="explain">The released material classes are frozen dead-position results. The opponent uses any legal move; unfinished KRK material is not part of this playable engine.</p>
          ${mode==='playing'&&engineNote?`<p class="engine-explanation"><strong>Last engine decision:</strong> ${engineNote}</p>`:''}
          <p class="rules-note">Exploration mode deliberately suspends FIDE’s immediate dead-position termination so you can move the pieces. It is not a normal tournament game. KRK is held back pending full upstream completion and explicit owner approval.</p>
        </div>
        <div class="panel history"><div class="section-head"><span class="label">04 / MOVE HISTORY</span><span class="mini-tag">${mode==='playing'?game.log.length:0} PLIES</span></div>
        <div class="moves">${mode==='playing'&&game.log.length?game.log.map((line,i)=>`<div class="move-row"><span>${i+1}</span><span>${line}</span></div>`).join(''):'<p class="empty">Moves appear here after starting.</p>'}</div>
        ${gameOver?`<p class="game-over">${status()}</p>`:''}</div>
      </aside>
    </div><footer>Independent implementation · No tablebases, external chess engine, runtime GitHub calls or API keys · <a href="https://github.com/jfairfaxball-348/engame-chess" target="_blank" rel="noopener noreferrer">Parent research</a> is never modified</footer>
  </div>`;
  root.querySelectorAll('[data-sq]').forEach(node=>node.addEventListener('click',()=>interact(Number(node.dataset.sq))));
  root.querySelectorAll('[data-class]').forEach(node=>node.addEventListener('click',()=>setMaterial(node.dataset.class)));
  root.querySelectorAll('[data-piece]').forEach(node=>node.addEventListener('click',()=>{active=node.dataset.piece;render();}));
  root.querySelector('#player')?.addEventListener('change',e=>{human=e.target.value;render();});
  root.querySelector('#turn')?.addEventListener('change',e=>{toMove=e.target.value;render();});
  root.querySelector('#start')?.addEventListener('click',launch);
  root.querySelector('#reset')?.addEventListener('click',()=>setMaterial(material));
  root.querySelector('#edit')?.addEventListener('click',startEditor);
}
render();

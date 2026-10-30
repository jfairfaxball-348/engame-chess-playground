/** The Maths tab is completely separate from the Engine Playground. */
import {legalMoves,newGame,play,outcome,opposite,inCheck,squareName} from './chess.js';
import {chooseMathsOpponent,mathsPlayMove,KRK_EXPERIMENTAL_DESCRIPTION} from './maths-play-policy.js';
import {pieceSVG,pieceLabel} from './pieces.js';
import {squareForCell,squareAtPoint} from './board-ui.js';
import {INVENTORY,blankBoard,available,put,relocate,setupVerdict} from './maths-model.js';
import {proofFor} from './maths-proof.js';
const root=document.getElementById('app');
let board=blankBoard(),turn='w',human='w',game=null,phase='setup',picked=null,selected=-1;
let facing='w',last=null,notice='',timer=null,busy=false,gesture=null,suppress=false,history=[],openingPending=false,policyToken=null;
const name=c=>c==='w'?'White':'Black',ongoing=()=>outcome(game.board,game.turn,game.history,game.halfmove).kind==='ongoing';
const announcement=document.createElement('div');
announcement.className='sr-only';announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');root.after(announcement);
function cancelGesture(){
 if(!gesture)return;
 try{if(gesture.node.hasPointerCapture(gesture.id))gesture.node.releasePointerCapture(gesture.id);}catch{}
 gesture.ghost?.remove();gesture=null;
 root.querySelectorAll('.maths-drop,.maths-drag-source').forEach(x=>x.classList.remove('maths-drop','maths-drag-source'));
}
function cancel(){if(timer!==null)clearTimeout(timer);timer=null;busy=false;cancelGesture();}
function reset(){cancel();board=blankBoard();turn='w';game=null;phase='setup';picked=null;selected=-1;last=null;notice='';history=[];openingPending=false;policyToken=null;facing='w';render();}
function edit(){cancel();phase='setup';game=null;picked=null;selected=-1;last=null;history=[];openingPending=false;policyToken=null;notice='';render();}
function trayClick(piece){if(phase!=='setup'||!available(board,piece))return;picked=picked===piece?null:piece;selected=-1;notice='';render();}
function putOrMove(sq){
 if(picked){const next=put(board,picked,sq);if(next){board=next;picked=null;notice='';}else notice='Choose an empty square.';}
 else if(selected>=0){
  const next=relocate(board,selected,sq===selected?-1:sq);
  if(next){board=next;selected=-1;notice='';}
  else if(board[sq])selected=sq;
 } else if(board[sq])selected=sq;
 render();
}
function launch(){
 const v=setupVerdict(board,turn);
 if(!v.canStart)return;
 cancel();human=v.human;
 // Keep the original board orientation and ALL placed squares at the game start.
 try{game=newGame(board,turn,v.material,{experimentalKRK:v.experimental===true});}catch(e){notice=e.message;render();return;}
 phase='playing';selected=-1;picked=null;last=null;history=[];policyToken=null;notice='';
 openingPending=game.turn!==human&&outcome(game.board,game.turn,game.history,game.halfmove).kind==='ongoing';
 render();
}
function save(){return {game:{...game,board:game.board.slice(),history:game.history.slice(),log:game.log.slice()},last:last?{...last}:null,openingPending,policyToken};}
function undo(){if(!history.length)return;cancel();const h=history.pop();game=h.game;last=h.last;openingPending=h.openingPending;policyToken=h.policyToken;selected=-1;notice='';render();}
function humanMove(from,to){
 if(phase!=='playing'||busy||game.turn!==human||!ongoing())return false;
 const m=legalMoves(game.board,human).find(m=>m.from===from&&m.to===to);
 if(!m)return false;
 history.push(save());game=mathsPlayMove(game,m);if(game.material!=='krk')policyToken=null;
 last={from,to};selected=-1;notice='';render();opponent();return true;
}
function playOpeningMove(){
 if(phase!=='playing'||!openingPending||busy||game.turn===human)return;
 history.push(save());openingPending=false;opponent();
}
function opponent(){
 if(phase!=='playing'||openingPending||game.turn===human||!ongoing())return;
 busy=true;render();
 timer=setTimeout(()=>{
  timer=null;const decision=chooseMathsOpponent(game,opposite(human),policyToken);busy=false;
  if(decision?.move){
   last={from:decision.move.from,to:decision.move.to};
   game=mathsPlayMove(game,decision.move);
   policyToken=decision.continuationToken??null;
   notice='';
  }else{
   notice=game.material==='krk'? 'Experimental KRK cannot continue from this position using the current proof-derived controller. Undo or choose New position. No substitute engine move was played.': 'No legal opponent decision.';
  }
  selected=-1;render();
 },260);
}
function squareClick(sq){
 if(phase==='setup'){putOrMove(sq);return;}
 if(busy||game.turn!==human||!ongoing())return;
 const p=game.board[sq];
 if(selected>=0){
  if(sq===selected){selected=-1;render();return;}
  if(humanMove(selected,sq))return;
 }
 selected=p?.[0]===human?sq:-1;render();
}
function current(){return phase==='setup'?board:game.board;}
function boardMarkup(){
 const b=current(),legal=phase==='playing'&&selected>=0&&!busy&&game.turn===human?
  new Set(legalMoves(b,human).filter(m=>m.from===selected).map(m=>m.to)):new Set();
 let output='';
 for(let r=0;r<8;r++)for(let c=0;c<8;c++){
  const s=squareForCell(r,c,facing),p=b[s],file=s%8,rank=Math.floor(s/8)+1,light=(file+rank)%2===0;
  const check=phase==='playing'&&p===game.turn+'K'&&inCheck(b,game.turn);
  const classes='maths-cell '+(light?'light':'dark')+(selected===s?' maths-selected':'')+
    (last&&(last.from===s||last.to===s)?' maths-recent':'')+(check?' maths-check':'');
  output+='<button type="button" class="'+classes+'" data-sq="'+s+'" aria-pressed="'+(selected===s)+
   '" aria-label="'+squareName(s)+' '+pieceLabel(p)+(legal.has(s)?', legal destination':'')+'">'+
   pieceSVG(p)+(legal.has(s)?'<span class="maths-dot"></span>':'')+
   (c===0?'<span class="maths-coordinate rank">'+rank+'</span>':'')+
   (r===7?'<span class="maths-coordinate file">'+('abcdefgh'[file])+'</span>':'')+'</button>';
 }
 return output;
}
function rack(color){
 let output='<div class="maths-tray" aria-label="'+name(color)+' pieces">';
 INVENTORY.forEach((type,i)=>{
  const p=color+type,ok=phase==='setup'&&available(board,p),sel=phase==='setup'&&picked===p;
  output+='<button type="button" class="maths-tray-piece '+(ok?'maths-available':'maths-unavailable')+
   (sel?' maths-tray-picked':'')+'" data-slot="'+p+'" data-index="'+i+'" '+(ok?'':'disabled')+
   ' aria-pressed="'+sel+'" aria-label="'+pieceLabel(p)+(ok?' available':' unavailable')+
   '" title="'+pieceLabel(p)+'">'+pieceSVG(p)+'</button>';
 });
 return output+'</div>';
}
function target(x,y){
 const el=root.querySelector('.maths-board');
 return el?squareAtPoint(el.getBoundingClientRect(),x,y,facing):-1;
}
function down(e){
 if(!e.isPrimary||e.button!==0||gesture)return;
 suppress=false;
 const el=e.target.closest('[data-slot],[data-sq]');if(!el||!root.contains(el))return;
 const slot=el.dataset.slot,from=el.dataset.sq===undefined?-1:Number(el.dataset.sq);
 const piece=slot||current()[from];if(!piece)return;
 if(phase==='setup'&&slot&&!available(board,piece))return;
 if(phase==='playing'&&(slot||busy||game.turn!==human||piece[0]!==human||!ongoing()))return;
 gesture={id:e.pointerId,node:el,from,piece,x:e.clientX,y:e.clientY,dragged:false,ghost:null};
 try{el.setPointerCapture(e.pointerId);}catch{}
}
function move(e){
 const g=gesture;if(!g||g.id!==e.pointerId)return;
 if(!g.dragged&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<6)return;
 if(!g.dragged){
  g.dragged=true;g.node.classList.add('maths-drag-source');
  g.ghost=document.createElement('div');g.ghost.className='maths-ghost';
  g.ghost.innerHTML=pieceSVG(g.piece);document.body.append(g.ghost);
 }
 g.ghost.style.left=e.clientX+'px';g.ghost.style.top=e.clientY+'px';
 root.querySelectorAll('.maths-drop').forEach(n=>n.classList.remove('maths-drop'));
 const t=target(e.clientX,e.clientY);
 if(t>=0)root.querySelector('[data-sq="'+t+'"]')?.classList.add('maths-drop');
}
function up(e){
 const g=gesture;if(!g||g.id!==e.pointerId)return;
 const dragged=g.dragged,to=target(e.clientX,e.clientY);
 cancelGesture();if(!dragged)return;
 suppress=true;
 if(phase==='setup'){
  const next=g.from<0?put(board,g.piece,to):relocate(board,g.from,to);
  if(next){board=next;picked=null;selected=-1;notice='';}
  else notice='Drop on an empty square.';
  render();
 }else{if(to>=0)humanMove(g.from,to);else render();}
}
const escapeText=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function proofMarkup(pos,side){
 const p=proofFor(pos,side);
 if(!p)return '';
 return '<div class="maths-equation" aria-label="Outcome equation">'+escapeText(setupVerdict(pos,side).equation)+'</div>'+
  '<div class="maths-proof"><h2>Proof</h2><p class="maths-proof-lead">'+escapeText(p.lead)+'</p>'+
  '<div class="maths-worked"><span>For this board</span><strong>'+escapeText(p.working)+'</strong></div>'+
  '<ol class="maths-proof-steps">'+p.steps.map(x=>'<li><span class="maths-proof-math">'+escapeText(x.math)+
     '</span><span class="maths-proof-reason">'+escapeText(x.why)+'</span></li>').join('')+'</ol>'+
  '<a class="maths-theorem" target="_blank" rel="noopener noreferrer" href="'+escapeText(p.sourceUrl)+'">'+
  escapeText(p.source)+' · Read frozen Lean proof ↗</a>'+
  (p.auxSourceUrl?'<a class="maths-theorem" target="_blank" rel="noopener noreferrer" href="'+
  escapeText(p.auxSourceUrl)+'">'+escapeText(p.auxSource)+' · Exact mating-move theorem ↗</a>':'')+
  '</div>';
}
function render(){
 if(gesture)cancelGesture();
 const el=root.contains(document.activeElement)?document.activeElement:null;
 const attr=['data-sq','data-slot','id'].find(x=>el?.hasAttribute(x));
 const value=attr?el.getAttribute(attr):null;
 const playing=phase==='playing',v=setupVerdict(current(),playing?game.turn:turn);
 const final=playing?outcome(game.board,game.turn,game.history,game.halfmove):null;
 const title=final?.kind==='mate'?name(final.winner)+' wins':
  final&&['stalemate','75-move','fivefold'].includes(final.kind)?'Draw':v.title;
 const formula=v.equation?proofMarkup(current(),playing?game.turn:turn):'';
 root.innerHTML='<section class="maths-shell"><h1 class="maths-heading">Chess <span>· Mathematics</span></h1>'+
  '<div class="maths-layout"><aside class="maths-side maths-white">'+rack('w')+'</aside>'+
  '<div class="maths-centre"><div class="maths-board" role="group" aria-label="Endgame chessboard">'+boardMarkup()+'</div>'+
  '<div class="maths-controls">'+(playing?
   (openingPending?'<button id="maths-first" class="maths-primary">Play opponent’s first move</button>':'')+
   '<button id="maths-undo" '+(history.length?'':'disabled')+'>Undo</button>'+
   '<button id="maths-edit">New position</button><span class="maths-turn">You play '+name(human)+
   ' · '+(openingPending?'Starting position · Opponent to move':busy?'Opponent moving':name(game.turn)+' to move')+'</span>':
   '<button id="maths-turn-w" class="'+(turn==='w'?'maths-active':'')+'">White to move</button>'+
   '<button id="maths-turn-b" class="'+(turn==='b'?'maths-active':'')+'">Black to move</button>'+
   '<button id="maths-start" class="maths-primary" '+(v.canStart?'':'disabled')+'>Start game</button>'+
   '<button id="maths-clear">Clear</button>')+'</div>'+
  '<div class="maths-notice" role="status">'+(notice||(!playing&&v.kind==='invalid'?v.reason:''))+'</div></div>'+
  '<aside class="maths-side maths-black">'+rack('b')+'</aside>'+
  '<section class="maths-verdict" aria-live="polite"><div class="maths-outcome">'+title+'</div>'+formula+
  (playing&&game.material==='krk'||!playing&&v.experimental?'<div class="maths-policy">'+escapeText(KRK_EXPERIMENTAL_DESCRIPTION)+'</div>':'')+
  '</section></div></section>';
 root.querySelector('#maths-turn-w')?.addEventListener('click',()=>{turn='w';notice='';render();});
 root.querySelector('#maths-turn-b')?.addEventListener('click',()=>{turn='b';notice='';render();});
 root.querySelector('#maths-start')?.addEventListener('click',launch);
 root.querySelector('#maths-clear')?.addEventListener('click',reset);
 root.querySelector('#maths-edit')?.addEventListener('click',edit);
 root.querySelector('#maths-undo')?.addEventListener('click',undo);
 root.querySelector('#maths-first')?.addEventListener('click',playOpeningMove);
 if(attr&&value!==null)root.querySelector('['+attr+'="'+value+'"]')?.focus({preventScroll:true});
 announcement.textContent=title+(notice?' · '+notice:'');
}
root.addEventListener('click',e=>{
 if(suppress){suppress=false;return;}
 const slot=e.target.closest('[data-slot]');if(slot){trayClick(slot.dataset.slot);return;}
 const cell=e.target.closest('[data-sq]');if(cell)squareClick(Number(cell.dataset.sq));
});
root.addEventListener('pointerdown',down);
root.addEventListener('pointermove',move);
root.addEventListener('pointerup',up);
root.addEventListener('pointercancel',()=>{cancelGesture();suppress=false;});
root.addEventListener('keydown',e=>{
 if(e.key==='Escape'){picked=null;selected=-1;render();}
 if(phase==='setup'&&(e.key==='Delete'||e.key==='Backspace')&&selected>=0){
  board=relocate(board,selected,-1)??board;selected=-1;e.preventDefault();render();
 }
});
render();

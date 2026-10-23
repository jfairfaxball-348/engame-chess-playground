// UCI engine choices are separate from the proof-gated endgame opponent.
// Browser workers run entirely on the viewer's machine.
export const ENGINE_OPTIONS = Object.freeze([
  {id:'stockfish',name:'Stockfish 19 Lite',url:'/engines/stockfish-19-lite-single.js',search:'go movetime 350',note:'Stockfish 19.0.1 · single-threaded lite WASM'},
  {id:'lozza',name:'Lozza',url:'/engines/lozza.js',search:'go movetime 450 depth 4',note:'Lozza JavaScript UCI engine'}
]);
export const engineById = id => ENGINE_OPTIONS.find(item=>item.id===id);
export function parseBestmove(line){
  const found=/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)\b/i.exec(String(line).trim());
  if(!found)return null;
  const uci=found[1].toLowerCase();
  return {from:uci.slice(0,2),to:uci.slice(2,4),...(uci.length===5?{promotion:uci[4]}:{})};
}
export function parseScore(line,colour){
  const found=/\bscore (cp|mate) (-?\d+)/.exec(String(line));
  if(!found)return null;
  const value=Number(found[2])*(colour==='b'?-1:1);
  return found[1]==='mate'?'M'+value:(value/100).toFixed(2);
}

/** Captures earned by each player. Opponent-colour icons and net captured points. */
export function captureSummary(moves){
  const scores={p:1,n:3,b:3,r:5,q:9};
  const result={w:{pieces:[],value:0,advantage:0},b:{pieces:[],value:0,advantage:0}};
  for(const move of moves){
    if(!move.captured||!result[move.color]||!scores[move.captured])continue;
    const side=result[move.color];
    side.pieces.push((move.color==='w'?'b':'w')+move.captured.toUpperCase());
    side.value+=scores[move.captured];
  }
  const order={Q:0,R:1,B:2,N:3,P:4};
  for(const colour of ['w','b']){
    result[colour].pieces.sort((a,b)=>order[a[1]]-order[b[1]]);
    result[colour].advantage=Math.max(0,result[colour].value-result[colour==='w'?'b':'w'].value);
  }
  return result;
}

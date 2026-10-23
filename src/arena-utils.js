// UCI engine choices are separate from the proof-gated endgame opponent.
// Browser workers run entirely on the viewer's machine.
export const ENGINE_OPTIONS = Object.freeze([
  {id:'stockfish',name:'Stockfish 19 Lite',url:'/engines/stockfish-19-lite-single.js',search:'go movetime 350',note:'Stockfish 19.0.1 · single-threaded lite WASM'},
  {id:'lozza',name:'Lozza',url:'/engines/lozza.js',search:'go depth 5',note:'Lozza JavaScript UCI engine'}
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

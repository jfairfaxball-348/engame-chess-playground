import { cpSync, copyFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
rmSync('dist',{recursive:true,force:true});
mkdirSync('dist',{recursive:true});
copyFileSync('index.html','dist/index.html');
cpSync('src','dist/src',{recursive:true});
mkdirSync('dist/vendor',{recursive:true});
copyFileSync('node_modules/chess.js/dist/esm/chess.js','dist/vendor/chess.js');
mkdirSync('dist/engines',{recursive:true});
const sf='stockfish-19-lite-single';
for(const ext of ['js','wasm']){
  copyFileSync(join('node_modules/stockfish/bin',sf+'.'+ext),join('dist/engines',sf+'.'+ext));
}
const lozza='node_modules/@intrastellar/lozza/index.js';
if(!existsSync(lozza))throw Error('Lozza engine entry not installed');
copyFileSync(lozza,'dist/engines/lozza.js');
console.log('Static site, isolated full-chess rules and two local UCI engines built in dist/.');

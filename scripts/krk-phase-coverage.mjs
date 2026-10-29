/**
 * Finite coverage DIAGNOSTIC ONLY — never a game-policy lookup.
 *
 * Check every geometrically legal fresh strong-turn KRK board (both colours)
 * against the input PREMISES of the exact frozen local Lean rules.
 * A rule matching a root does not prove a globally progressing continuation.
 * This script intentionally neither solves boards nor stores position values.
 */
import {makeBoard,coords,distance,validateSetup} from '../src/chess.js';
import {pathToFileURL} from 'node:url';
import {KRK_FRAMES,krkTransformSquare} from '../src/krk-local-witness.js';
const abs=(a,b)=>Math.abs(a-b);
export function applicableGeometry(sk,rs,wk,frame='id'){
  const [sx,sy]=coords(krkTransformSquare(sk,frame));
  const [rx,ry]=coords(krkTransformSquare(rs,frame));
  const [wx,wy]=coords(krkTransformSquare(wk,frame));
  const margin=abs(rx,wx);
  const wall=sy<ry&&ry<wy;
  const gap=sy+2<=wy;
  const source={wall,
    entry:gap&&margin>=2&&(rx!==sx||sy<ry)&&ry!==sy+1,
    retreat:gap&&sy===ry&&sy>0,
    backrank:gap&&sy===0&&ry===0&&abs(sx,rx)===1,
    // The remaining phase cases require a wall. A local step may consume
    // margin and is NOT necessarily followed by another matching step.
    prep:wall&&margin>=2&&Math.max(ry-(sy+1),sx<3?3-sx:sx>4?sx-4:0)>0,
    rankTwo:wall&&ry+2<=wy&&margin>=2,
    rankAdvance:wall&&sy+2<=ry&&ry+2<=wy&&margin>=3,
    rescue:wall&&distance(krkTransformSquare(rs,frame),krkTransformSquare(wk,frame))<2};
  return source;
}
export function auditKRKPhaseDomains(){
  const total={legal:0,canonical:0,wall:0,firstStep:0,uncovered:0};
  const rules={};const samples=[];
  for(const colour of ['w','b']){
    const weak=colour==='w'?'b':'w',board=makeBoard();
    for(let sk=0;sk<64;sk++){
      board[sk]=colour+'K';
      for(let wk=0;wk<64;wk++){
        if(wk===sk||distance(sk,wk)<2)continue;
        board[wk]=weak+'K';
        for(let rs=0;rs<64;rs++){
          if(rs===sk||rs===wk)continue;
          board[rs]=colour+'R';
          if(validateSetup(board,'krk',colour)===null){
            total.legal++;
            let first=false,wall=false,canon=false;
            for(const f of KRK_FRAMES){
              const [sx,sy]=coords(krkTransformSquare(sk,f));
              const [,wy]=coords(krkTransformSquare(wk,f));
              if(sy+2>wy)continue;
              canon=true;
              const domain=applicableGeometry(sk,rs,wk,f);
              if(domain.wall)wall=true;
              if(domain.entry||domain.retreat||domain.backrank)first=true;
              for(const [k,v] of Object.entries(domain))if(v)rules[k]=(rules[k]||0)+1;
            }
            if(canon)total.canonical++;
            if(wall)total.wall++;
            if(first)total.firstStep++;
            if(!wall&&!first){
              total.uncovered++;
              if(samples.length<12)samples.push({colour,sk,rs,wk});
            }
          }
          board[rs]=null;
        }
        board[wk]=null;
      }
      board[sk]=null;
    }
  }
  return {total,ruleFrameMatches:rules,samples};
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  const report=auditKRKPhaseDomains();
  console.log('KRK01 frozen phase premise coverage (NOT a playing-policy proof):');
  console.log(JSON.stringify(report,null,2));
  if(report.total.legal===0||report.total.canonical!==report.total.legal)
    process.exitCode=1;
}

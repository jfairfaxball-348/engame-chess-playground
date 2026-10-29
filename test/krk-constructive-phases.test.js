import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,squareAt,positionKey,legalMoves,validateSetup,applyMove,findKing,coords,distance,opposite} from '../src/chess.js';
import {KRK_FRAMES,krkTransformSquare,KRK_GAMEPLAY_RELEASED,krkLocalWitness,auditKRKLocalWitness} from '../src/krk-local-witness.js';
import {KRK_CONSTRUCTIVE_RULES,krkCentreDistance,krkPrepDistance,
  krkConstructiveStep,auditKRKConstructiveStep} from '../src/krk-constructive-phases.js';

const square=squareAt;
function state(color,sk,rs,wk){
  const b=makeBoard(),other=color==='w'?'b':'w';
  b[square(...sk)]=color+'K';b[square(...rs)]=color+'R';b[square(...wk)]=other+'K';
  return {board:b,turn:color,material:'krk',history:[positionKey(b,color)],halfmove:0,log:[]};
}
function transform(st,iso){
  const b=makeBoard();
  for(let i=0;i<64;i++)if(st.board[i])b[krkTransformSquare(i,iso)]=st.board[i];
  return {...st,board:b,history:[positionKey(b,st.turn)]};
}
const fixtures={
  entry:state('w',[3,0],[6,5],[4,6]),
  prep:state('w',[1,0],[3,4],[6,6]),
  rankTwo:state('w',[3,0],[0,2],[5,5]),
  rankAdvance:state('w',[3,0],[0,2],[5,5]),
  retreat:state('w',[3,2],[4,2],[6,5]),
  backrank:state('w',[3,0],[4,0],[6,4]),
  offrankRepair:state('w',[3,3],[4,1],[5,6]),
  backrankSetup:state('w',[3,0],[5,0],[4,4])
};
const expected={
  entry:square(6,1),prep:square(2,1),rankTwo:square(0,3),
  rankAdvance:square(0,3),retreat:square(3,1),backrank:square(4,1),
  offrankRepair:square(0,1),backrankSetup:square(4,0)
};
function witness(st,rule,iso='id'){
  const w=krkConstructiveStep(st,rule,iso);
  if(!w)return null;
  assert.equal(w.rule,KRK_CONSTRUCTIVE_RULES[rule]);
  assert.equal(w.maxMatePlies,null);
  assert.equal(w.isCompleteWinningPolicy,false);
  assert.equal(w.isometry,iso);
  assert.ok(legalMoves(st.board,st.turn).some(m=>m.from===w.move.from&&m.to===w.move.to));
  const a=auditKRKConstructiveStep(st,w);
  if(!a.ok){
    const child=applyMove(st.board,w.move),weak=opposite(st.turn);
    const dump=legalMoves(child,weak).map(reply=>{
      const b=applyMove(child,reply);
      return {move:reply.to,rook:coords(b.indexOf(st.turn+'R')),
        sk:coords(findKing(b,st.turn)),wk:coords(findKing(b,weak)),
        distance:distance(b.indexOf(st.turn+'R'),findKing(b,weak))};
    });
    assert.fail('All-reply postcondition failed '+rule+'/'+iso+'/'+JSON.stringify(st.board)+' replies='+JSON.stringify(dump));
  }
  assert.ok(a.replies>0);
  return w;
}

test('direct Lean centreDistance and prepDistance arithmetic matches named phase progress',()=>{
  assert.deepEqual([...Array(8)].map((_,i)=>krkCentreDistance(i)),[3,2,1,0,0,1,2,3]);
  assert.equal(krkPrepDistance(4,1,0),3);
  assert.equal(krkPrepDistance(4,2,1),2);
  assert.equal(krkPrepDistance(2,3,1),0);
});

test('eight constructive phase moves satisfy all legal weak replies in 4 frames and both colours',()=>{
  for(const color of ['w','b'])for(const iso of KRK_FRAMES)for(const rule of Object.keys(fixtures)){
    const f=fixtures[rule];
    const st=transform({...f,board:f.board.map(p=>p?
      (color==='w'?p:(p[0]==='w'?'b':'w')+p[1]):null),turn:color},iso);
    st.history=[positionKey(st.board,st.turn)];
    assert.equal(validateSetup(st.board,'krk',color),null);
    const w=witness(st,rule,iso);
    assert.ok(w,'expected applicable '+color+'/'+iso+'/'+rule);
    assert.equal(w.move.to,krkTransformSquare(expected[rule],iso));
    if(rule==='prep')assert.equal(w.localRank.after,w.localRank.before-1);
    if(rule==='rankAdvance'||rule==='rankTwo')
      assert.ok(w.localRank.after<w.localRank.before);
  }
});

test('constructive steps fail closed for unproved premises and forged evidence',()=>{
  const a=fixtures.prep;
  assert.equal(krkConstructiveStep(a,'unknown'),null);
  assert.equal(krkConstructiveStep(a,'prep','unverified'),null);
  assert.equal(krkConstructiveStep({...a,turn:'b'},'prep'),null);
  assert.equal(krkConstructiveStep({...a,halfmove:-1},'prep'),null);
  assert.equal(krkConstructiveStep({...a,history:null},'prep'),null);
  assert.equal(krkConstructiveStep(a,'backrank'),null);
  const w=krkConstructiveStep(a,'prep');
  assert.equal(auditKRKConstructiveStep(a,{...w,move:{...w.move,to:63}}).ok,false);
  assert.equal(auditKRKConstructiveStep(a,{...w,parent:'bad'}).ok,false);
  assert.equal(KRK_GAMEPLAY_RELEASED,false);
  const near=state('w',[3,0],[0,2],[1,3]);
  assert.equal(krkConstructiveStep(near,'rankAdvance'),null);
});

test('Lean wall entry admits a threatened rook; next strong turn can rescue it',()=>{
 const st=state('w',[0,0],[2,0],[0,3]);
 const entry=witness(st,'entry');
 assert.ok(entry);
 const child=applyMove(st.board,entry.move);
 const reply=legalMoves(child,'b').find(m=>m.to===square(1,2));
 assert.ok(reply,'the adversary must be allowed to threaten the rook');
 const b=applyMove(child,reply);
 const next={...st,board:b,history:[positionKey(b,'w')],halfmove:2};
 const rook=square(2,1),wk=square(1,2);
 assert.equal(distance(rook,wk),1,'the new wall does not imply a safe rook');
 const rescue=krkLocalWitness(next,'rescue');
 assert.ok(rescue,'frozen rescue lemma applies at the next strong turn');
 assert.ok(auditKRKLocalWitness(next,rescue).ok,'rescue preserves the wall for all replies');
 assert.equal(rescue.move.to,square(7,1));
});

test('sampled quantified phase families preserve local postconditions against every weak reply',()=>{
  const shapes=[
    [0,0,3],[0,1,3],[0,2,4],[0,3,6],[1,1,4],[1,2,4],
    [1,3,6],[2,0,6],[2,2,5],[2,3,6],[2,4,7],
    [3,1,6],[3,3,6],[3,4,7],[4,4,7]
  ];
  const counts=Object.fromEntries(Object.keys(KRK_CONSTRUCTIVE_RULES).map(k=>[k,0]));
  for(const color of ['w','b'])for(const [sy,ry,wy] of shapes)
    for(let sx=0;sx<8;sx++)for(let rx=0;rx<8;rx++)for(let wx=0;wx<8;wx++){
      const st=state(color,[sx,sy],[rx,ry],[wx,wy]);
      if(validateSetup(st.board,'krk',color))continue;
      for(const rule of Object.keys(KRK_CONSTRUCTIVE_RULES))
        if(witness(st,rule))counts[rule]++;
    }
  for(const [rule,n] of Object.entries(counts))assert.ok(n>0,rule+' had no fixture');
  console.log('KRK01 proved constructive phase fixtures:',counts);
});

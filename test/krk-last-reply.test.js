import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeBoard,squareAt,coords,applyMove,legalMoves,opposite,
  outcome,positionKey,validateSetup} from '../src/chess.js';
import {KRK_GAMEPLAY_RELEASED} from '../src/krk-local-witness.js';
import {krkImmediateMateWitness} from '../src/krk-immediate-witness.js';
import {KRK_LAST_REPLY_RULE,krkHorizontalLast,krkLastReplyGeometry,
  krkLastReplyWitness} from '../src/krk-last-reply.js';

const sq=squareAt;
const state=(colour,sk,rs,wk)=>{
  const b=makeBoard(),weak=opposite(colour);
  b[sq(...sk)]=colour+'K';b[sq(...rs)]=colour+'R';b[sq(...wk)]=weak+'K';
  return {board:b,turn:weak,material:'krk',halfmove:0,
    history:[positionKey(b,weak)],log:[]};
};

test('Lean HorizontalLast formula retains all four corner/interior shapes',()=>{
  assert.equal(krkHorizontalLast([1,5],[7,0],[0,7]),true);
  assert.equal(krkHorizontalLast([6,5],[0,0],[7,7]),true);
  assert.equal(krkHorizontalLast([4,5],[2,0],[3,7]),true);
  assert.equal(krkHorizontalLast([2,5],[4,0],[3,7]),true);
  assert.equal(krkHorizontalLast([3,5],[2,0],[3,7]),false);
  assert.equal(krkHorizontalLast([1,4],[7,0],[0,7]),false);
  assert.equal(krkHorizontalLast([1,5],[7,7],[0,7]),false);
});

test('complete 2-ply terminal certificate covers every legal weak reply for both colours and axes',()=>{
  const samples=[
    {sk:[1,5],rs:[7,0],wk:[0,7],axis:'horizontal'},
    {sk:[6,5],rs:[0,0],wk:[7,7],axis:'horizontal'},
    {sk:[4,5],rs:[2,0],wk:[3,7],axis:'horizontal'},
    {sk:[2,5],rs:[4,0],wk:[3,7],axis:'horizontal'}
  ];
  const swap=p=>[p[1],p[0]];
  for(const colour of ['w','b'])for(const s of samples)for(const axis of ['horizontal','vertical']){
    const sk=axis==='vertical'?swap(s.sk):s.sk;
    const rs=axis==='vertical'?swap(s.rs):s.rs;
    const wk=axis==='vertical'?swap(s.wk):s.wk;
    const st=state(colour,sk,rs,wk);
    assert.equal(validateSetup(st.board,'krk',st.turn),null);
    assert.equal(krkLastReplyGeometry(sk,rs,wk),axis);
    const cert=krkLastReplyWitness(st);
    assert.ok(cert,colour+' '+axis+' '+JSON.stringify(s));
    assert.equal(cert.rule,KRK_LAST_REPLY_RULE);
    assert.equal(cert.axis,axis);
    assert.equal(cert.maxMatePlies,2);
    assert.equal(cert.isCompleteWinningPolicy,false);
    const replies=legalMoves(st.board,st.turn);
    assert.equal(cert.branches.length,replies.length);
    for(const m of replies){
      const line=cert.branches.find(c=>c.responseFrom===m.from&&c.responseTo===m.to);
      assert.ok(line);
      const child=applyMove(st.board,m);
      const next=applyMove(child,line.matingMove);
      assert.equal(outcome(next,st.turn).kind,'mate');
      assert.equal(outcome(next,st.turn).winner,colour);
    }
  }
});

test('two-ply case fails closed on history, clock, illegal, and wrong turn',()=>{
  const st=state('w',[1,5],[7,0],[0,7]);
  assert.ok(krkLastReplyWitness(st));
  assert.equal(krkLastReplyWitness({...st,halfmove:1}),null);
  assert.equal(krkLastReplyWitness({...st,history:[]}),null);
  assert.equal(krkLastReplyWitness({...st,history:['forged']}),null);
  assert.equal(krkLastReplyWitness({...st,history:[...st.history,...st.history]}),null);
  assert.equal(krkLastReplyWitness({...st,turn:'w'}),null);
  assert.equal(krkLastReplyWitness({...st,material:'kk'}),null);
  assert.equal(krkLastReplyGeometry([1,5],[1,5],[0,7]),null);
  assert.equal(krkLastReplyGeometry([-1,5],[7,0],[0,7]),null);
  assert.equal(KRK_GAMEPLAY_RELEASED,true);
  const app=readFileSync('src/maths-app.js','utf8');
  assert.doesNotMatch(app,/chooseDecision\(.*krkLastReplyWitness/);
});

test('finite diagnostic: coordinate LastReply matches all legal weak replies leading to mate-in-one',()=>{
  // This independently checks a finite family. It is not a global Lean proof
  // and does NOT choose a winning move by a game-tree search.
  let valid=0,geometric=0,certified=0;
  for(const colour of ['w','b'])
    for(const wy of [0,7])
      for(const sy of [2,5])
        for(let sx=0;sx<8;sx++)
          for(let wx=0;wx<8;wx++)
            for(let rx=0;rx<8;rx++)
              for(const ry of [0,1,3,4,6,7]){
                const st=state(colour,[sx,sy],[rx,ry],[wx,wy]);
                if(validateSetup(st.board,'krk',st.turn))continue;
                const replies=legalMoves(st.board,st.turn);
                if(!replies.length)continue;
                valid++;
                const g=krkLastReplyGeometry([sx,sy],[rx,ry],[wx,wy]);
                const witness=krkLastReplyWitness(st);
                const allReady=replies.every(m=>{
                  if(m.capture)return false;
                  const b=applyMove(st.board,m);
                  return Boolean(krkImmediateMateWitness({
                    board:b,turn:colour,material:'krk',halfmove:1,
                    history:[...st.history,positionKey(b,colour)]
                  }));
                });
                assert.equal(Boolean(g),allReady,
                  'LastReply geometry mismatches direct mating replies '+colour+
                  ' sk '+sx+','+sy+' rook '+rx+','+ry+' wk '+wx+','+wy);
                assert.equal(Boolean(witness),Boolean(g));
                if(g)geometric++;
                if(witness)certified++;
              }
  assert.ok(valid>3000);
  assert.ok(geometric>20);
  assert.equal(certified,geometric);
  console.log('KRK01 two-ply LastReply family diagnostics:',{valid,geometric,certified});
});

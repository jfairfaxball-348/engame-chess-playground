import test from 'node:test';
import assert from 'node:assert/strict';
import {legalMoves,makeBoard,newGame,opposite,squareAt}
  from '../src/chess.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {auditS042FreshFamilies} from '../scripts/s042-fresh-families.mjs';
import {KQK32_FRAMES} from '../scripts/kqk32-far-file-audit.mjs';
import {authenticateS045Action,S045_FORWARD,S045_BACK,S045_QUEEN}
  from '../scripts/s045-source-premises.mjs';

const fromRoot=ex=>{
  const [pieces,turn]=ex.root.split(':');
  return newGame(pieces.match(/.{2}/g).map(s=>s==='--'?null:s),
    turn,'kqk',{experimentalKQK:true});
};

test('S045 authentic TightEntry forwarding on actual original-frame roots and all real weak replies',()=>{
  const audit=auditS042FreshFamilies({
    maxPerFamily:24,maxCandidates:256,maxNodes:8,maxPairs:2,full:true});
  let forward=0,colours=new Set();
  for(const ex of audit.examples){
    const root=fromRoot(ex),strong=ex.strong,weak=opposite(strong);
    const first=kqkSourceChoice(root,strong);
    if(!first?.continuationPhase||
       first.continuationPhase.kind!=='tight-file')continue;
    const after=mathsPlayMove(root,first.move);
    for(const reply of legalMoves(after.board,weak)){
      const state=mathsPlayMove(after,reply);
      const choice=kqkSourceChoice(state,strong,first.continuationPhase);
      if(choice?.sourcePhase!==S045_FORWARD)continue;
      forward++;colours.add(strong);
      const correct=authenticateS045Action(state,strong,choice,
        first.continuationPhase);
      assert.equal(correct.status,'authenticated',JSON.stringify({ex,reply,correct}));
      assert.equal(correct.globalMateCertified,false);
      assert.equal(authenticateS045Action(state,strong,
        {...choice,move:{...choice.move,to:(choice.move.to+1)%64}},
        first.continuationPhase).status,'failed-premise');
      assert.equal(authenticateS045Action(state,strong,choice,
        {...first.continuationPhase,moveCount:-3}).status,'failed-premise');
      assert.equal(authenticateS045Action(state,strong,choice,
        {...first.continuationPhase,frame:'unregistered'}).status,'unchecked');
      assert.equal(authenticateS045Action(state,strong,choice,
        {...first.continuationPhase,weak:reply.to}).status,'failed-premise');
      assert.equal(authenticateS045Action(state,strong,choice,null).status,
        'unchecked','cannot authenticate a two-ply theorem with no source token');
      const altered={...state,history:state.history.slice()};
      altered.history[altered.history.length-2]=altered.history[0];
      assert.equal(authenticateS045Action(altered,strong,choice,
        first.continuationPhase).status,'failed-premise',
        'token must match real saved post-attacker board');
    }
  }
  assert.ok(forward>0,'actual S044 widened roots must reach named forward-wall');
  assert.deepEqual([...colours].sort(),['b','w']);
  assert.equal(audit.preparedTokensInvented,false);
  assert.equal(audit.globalKQKMateCertified,false);
});

test('S045 exact SameRankEntry king step and every original-frame protected queen reply',()=>{
  let checked=0;
  for(const strong of ['w','b'])for(const [name,transform] of
    Object.entries(KQK32_FRAMES)){
    const at=p=>squareAt(...transform(p)),weak=opposite(strong);
    const board=makeBoard();
    board[at([4,0])]=strong+'K';
    board[at([2,0])]=strong+'Q';
    board[at([3,3])]=weak+'K';
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const choice=kqkSourceChoice(root,strong);
    if(choice?.sourcePhase!==S045_BACK)continue;
    checked++;
    assert.equal(authenticateS045Action(root,strong,choice).status,
      'authenticated',name+' '+strong);
    assert.equal(authenticateS045Action(root,strong,
      {...choice,move:{...choice.move,to:(choice.move.to+1)%64}}).status,
      'failed-premise');
    assert.equal(authenticateS045Action(root,strong,
      {...choice,continuationPhase:{...choice.continuationPhase,moveCount:-1}})
      .status,'failed-premise');
    const after=mathsPlayMove(root,choice.move);
    for(const reply of legalMoves(after.board,weak)){
      const state=mathsPlayMove(after,reply),next=kqkSourceChoice(state,strong,
        choice.continuationPhase);
      assert.equal(next?.sourcePhase,S045_QUEEN);
      const result=authenticateS045Action(state,strong,next,
        choice.continuationPhase);
      assert.equal(result.status,'authenticated',JSON.stringify({strong,name,reply,result}));
      assert.equal(result.globalMateCertified,false);
      assert.equal(authenticateS045Action(state,strong,next,
        {...choice.continuationPhase,weak:reply.to}).status,'failed-premise');
      assert.equal(authenticateS045Action(state,strong,
        {...next,move:{...next.move,to:(next.move.to+1)%64}},
        choice.continuationPhase).status,'failed-premise');
    }
  }
  assert.ok(checked>=2,'both colours select a genuine framed king step');
});

test('S045 direct protected queen has no invented incoming token and rejects bad premises',()=>{
  for(const strong of ['w','b']){
    const weak=opposite(strong),board=makeBoard();
    board[squareAt(2,0)]=strong+'K';
    board[squareAt(1,0)]=strong+'Q';
    board[squareAt(2,3)]=weak+'K';
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const move=legalMoves(root.board,strong).find(m=>
      m.from===squareAt(1,0)&&m.to===squareAt(1,1));
    assert.ok(move);
    const choice={sourcePhase:S045_QUEEN,frame:'id',move};
    assert.equal(authenticateS045Action(root,strong,choice).status,
      'authenticated');
    const wrong=makeBoard();
    wrong[squareAt(4,0)]=strong+'K';
    wrong[squareAt(1,0)]=strong+'Q';
    wrong[squareAt(2,3)]=weak+'K';
    const altered=newGame(wrong,strong,'kqk',{experimentalKQK:true});
    assert.equal(authenticateS045Action(altered,strong,choice).status,
      'failed-premise');
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBoard,newGame,legalMoves,squareAt} from '../src/chess.js';
import {kqkSourceChoice} from '../src/kqk-source-policy.js';
import {mathsPlayMove} from '../src/maths-play-policy.js';
import {auditS042FreshFamilies}
  from '../scripts/s042-fresh-families.mjs';
import {
  authenticateS044Action,S044_FAR,S044_CROSS,S044_RISE
} from '../scripts/s044-source-premises.mjs';

const rootFromWitness=x=>{
  const [pieces,turn]=x.root.split(':');
  const board=pieces.match(/.{2}/g).map(p=>p==='--'?null:p);
  return newGame(board,turn,'kqk',{experimentalKQK:true});
};

test('S044 first genuine escape-preserving FarFile selections validate every reply',()=>{
  const r=auditS042FreshFamilies({
    maxPerFamily:8,maxCandidates:128,maxNodes:12,maxPairs:3,full:true});
  const roots=r.examples.filter(e=>e.firstSource===S044_FAR);
  assert.ok(roots.length>0,'S043 recorded two real first-root FarFile instances');
  for(const ex of roots){
    const state=rootFromWitness(ex);
    const c=kqkSourceChoice(state,ex.strong,null);
    assert.equal(c.sourcePhase,S044_FAR);
    assert.equal(c.move.from+'-'+c.move.to,ex.firstMove);
    const p=authenticateS044Action(state,ex.strong,c,null);
    assert.equal(p.status,'authenticated',JSON.stringify({ex,p}));
    assert.ok(p.legalWeakReplies>0);
    assert.equal(p.globalMateCertified,false);
    assert.equal(authenticateS044Action(state,ex.strong,
      {...c,move:{...c.move,to:(c.move.to+1)%64}},null).status,
      'failed-premise');
  }
  assert.equal(r.preparedTokensInvented,false);
  assert.equal(r.globalKQKMateCertified,false);
});

test('S044 frozen king_cross and noncorner queen_rise follow every real weak reply',()=>{
  for(const strong of ['w','b']){
    const weak=strong==='w'?'b':'w',board=makeBoard();
    board[squareAt(3,1)]=strong+'K';
    board[squareAt(3,2)]=strong+'Q';
    board[squareAt(4,4)]=weak+'K';
    const root=newGame(board,strong,'kqk',{experimentalKQK:true});
    const cross=kqkSourceChoice(root,strong);
    assert.equal(cross?.sourcePhase,S044_CROSS,
      'original frame must select the exact proved king crossing');
    assert.equal(authenticateS044Action(root,strong,cross).status,
      'authenticated');
    const after=mathsPlayMove(root,cross.move);
    const replies=legalMoves(after.board,weak);
    assert.ok(replies.length>0);
    for(const reply of replies){
      const nextState=mathsPlayMove(after,reply);
      const rise=kqkSourceChoice(nextState,strong,cross.continuationPhase);
      assert.equal(rise?.sourcePhase,S044_RISE,
        'use only actual band-raise token and named theorem move');
      const verdict=authenticateS044Action(nextState,strong,rise,
        cross.continuationPhase);
      assert.equal(verdict.status,'authenticated',
        JSON.stringify({strong,reply,verdict}));
      assert.equal(verdict.globalMateCertified,false);
      assert.equal(authenticateS044Action(nextState,strong,rise,
        {...cross.continuationPhase,moveCount:-1}).status,
        'failed-premise');
      assert.equal(authenticateS044Action(nextState,strong,rise,null).status,
        'unchecked','a queen-rise must not be credited without its real token');
    }
    assert.equal(authenticateS044Action(root,strong,
      {...cross,move:{...cross.move,to:(cross.move.to+1)%64}}).status,
      'failed-premise');
  }
});

test('S044 does not authenticate a missing, unknown or misframed theorem',()=>{
  assert.equal(authenticateS044Action(null,'w',
    {sourcePhase:'KQK.Unrecognised'}).status,'not-independently-checked');
  const board=makeBoard();
  board[squareAt(3,1)]='wK';
  board[squareAt(3,2)]='wQ';
  board[squareAt(4,4)]='bK';
  const root=newGame(board,'w','kqk',{experimentalKQK:true});
  const choice=kqkSourceChoice(root,'w');
  assert.equal(authenticateS044Action(root,'w',
    {...choice,frame:'unregistered'}).status,'unchecked');
});

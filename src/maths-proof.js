/**
 * Short, sourced proof derivations for the frozen endgame classes.
 * These explain the upstream proofs; they do NOT execute Lean or choose moves.
 * Neither the Engine Playground nor any remote tablebase is used.
 */
import {coords,findKing,distance,squareName,legalMoves,outcome,positionKey} from './chess.js';
import {krkImmediateMateWitness} from './krk-immediate-witness.js';
import {extras,materialOf,setupVerdict} from './maths-model.js';

const root='https://github.com/jfairfaxball-348/engame-chess/blob/main/';
const krkRoot='https://github.com/jfairfaxball-348/engame-chess/blob/e7de0930fc61caeb11795cf3c10fde11e4774a40/';
const theoremPaths={
 kk:'theorems/frozen/EC-T0003/v1.md',
 kbk:'theorems/frozen/EC-T0004/v1.md',
 knk:'theorems/frozen/EC-T0005/v1.md',
 krk:'theorems/frozen/EC-T0048/v1.md'
};
const colour=c=>c==='w'?'White':'Black';
const parity=s=>{const [x,y]=coords(s);return (x+y)%2;};
const squareColour=s=>parity(s)===0?'dark':'light';
const step=(math,why)=>({math,why});

export function proofFor(board,turn){
 const v=setupVerdict(board,turn),kind=v.material;
 if(!v.source||!theoremPaths[kind])return null;
 const kw=findKing(board,'w'),kb=findKing(board,'b');
 const D=distance(kw,kb),[wx,wy]=coords(kw),[bx,by]=coords(kb);
 const dx=Math.abs(wx-bx),dy=Math.abs(wy-by);
 const general={
  source:v.source,sourceUrl:(kind==='krk'?krkRoot:root)+theoremPaths[kind],
  rule:'FIDE 5.2.2',result:v.title,material:kind,
  position:'Kings '+squareName(kw)+' / '+squareName(kb)+
   ': d∞ = max('+dx+', '+dy+') = '+D
 };
 if(kind==='kk')return {...general,
  lead:'No legal sequence of king moves can ever produce checkmate.',
  working:'d∞('+squareName(kw)+', '+squareName(kb)+') = max(|Δfile|, |Δrank|) = '+D+' ≥ 2',
  steps:[
   step('d∞(K₁, K₂) ≥ 2','A legal position keeps the kings apart; a king checks only at distance 1.'),
   step('Legal(p,q) ⇒ d∞(K₁(q), K₂(q)) ≥ 2','Every subsequent legal king move preserves that separation.'),
   step('∀q ∈ Reach(p), ¬Mate(q)','Induction over any finite sequence: neither king can ever be in check.'),
   step('¬∃q ∈ Reach(p): Mate(q) ⇒ Dead(p) ⇒ D','There is no possible checkmate, so the position is drawn under the dead-position rule.')
  ],
  formal:'arisen_KK_dead'
 };
 const extra=extras(board)[0],strong=extra[0],weak=strong==='w'?'b':'w',piece=extra[1],
       x=board.indexOf(extra),k=findKing(board,weak);
 if(kind==='kbk'||kind==='knk'){
  const sq=squareName(x),chi=parity(x),cls=squareColour(x);
  const bishop=piece==='B';
  return {...general,
   lead:'Even with cooperation, a lone '+(bishop?'bishop':'knight')+' cannot checkmate a bare king.',
   working:'χ('+sq+') = (file + rank) mod 2 = '+chi+' ('+cls+' square)',
   steps:bishop?[
    step('χ(x,y) := (x + y) mod 2','Every diagonal bishop move preserves χ. This bishop stays on '+cls+' squares.'),
    step('B checks k ⇒ χ(B) = χ(k)','If the bishop checks the lone king, the checked king is on the bishop’s square colour.'),
    step('χ(h) = χ(v) ≠ χ(k)','Choose an inward horizontal escape h and vertical escape v. Neither is attacked by the bishop.'),
    step('K protects h ∧ v ⇒ d∞(K,k) ≤ 1','The other king cannot protect both escapes without illegally standing next to k; at least one move is legal.'),
    step('Capture(B) ⇒ KK;  ∀q ∈ Reach(p), ¬Mate(q)','If the bishop is taken we reach the proved KK case. Legal continuations preserve these alternatives. Therefore Dead(p) ⇒ Draw.')
   ]:[
    step('N attacks k ⇒ (|Δx|, |Δy|) ∈ {(1,2),(2,1)}','A knight’s attack flips square colour: χ(N) ≠ χ(k).'),
    step('χ(h) = χ(v) = χ(N)','An orthogonal step flips χ again; h and v share the knight’s colour, which the knight cannot attack.'),
    step('K protects h ∧ v ⇒ d∞(K,k) ≤ 1','The other king cannot cover both orthogonal escapes while staying legally separated.'),
    step('N checks k ⇒ ∃ legal escape','A knight check therefore cannot be mate. If the knight is captured, the material becomes KK.'),
    step('∀q ∈ Reach(p), ¬Mate(q) ⇒ Dead(p) ⇒ D','Induction over every legal continuation, then the FIDE dead-position rule.')
   ],
   formal:bishop?'arisen_KBK_dead':'arisen_KNK_dead'
  };
 }
 if(kind==='krk'){
  const rookSquare=board.indexOf(extra);
  const weakKing=findKing(board,weak),strongKing=findKing(board,strong);
  const near=distance(rookSquare,weakKing),guard=distance(rookSquare,strongKing)===1;
  const legal=legalMoves(board,turn).length,terminal=outcome(board,turn);
  const mate=terminal.kind==='mate'&&terminal.winner===strong;
  const on=turn===strong;
  // In setup the board is an explicitly fresh, zero-clock root; there is no
  // implicit per-move refresh and no claim for a running KRK policy.
  const immediate=on?krkImmediateMateWitness({
    board,turn,material:'krk',halfmove:0,history:[positionKey(board,turn)]
  }):null;
  return {...general,
   lead:immediate?'An exact frozen mate-in-one witness applies to this fresh setup. Full KRK gameplay remains gated.':
    'The frozen theorem classifies each fresh-clock KRK outcome against every defence.',
   working:'d∞(R,k) = '+near+';  rook defended by K = '+(guard?'yes':'no')+
    ';  SafeRook = '+(v.safeRook?'true':'false')+
    (immediate?';  MateNow = true; R'+squareName(immediate.move.from)+' → '+squareName(immediate.move.to)+'#':''),
   steps:[
    ...(immediate?[step('MateNow(K,R,k) ⇒ R'+squareName(immediate.move.to)+'#',
      'The explicit '+immediate.case+' rook target satisfies the frozen geometric terminal criterion. '+
      'KRKImmediate.immediate_iff proves the legal move gives checkmate in one ply (EC-T0049).')]:[]),
    step('SafeRook ⇔ d∞(R,k) ≥ 2 ∨ d∞(R,K) = 1','Here: rook on '+squareName(rookSquare)+', weak king '+squareName(weakKing)+
      ', strong king '+squareName(strongKing)+'.'),
    step('Winσ(p) ⇔ (t = σ) ∨ Mateσ(p) ∨ (SafeRook ∧ Reply(p))',
      'Strong to move: '+(on?'yes':'no')+'; already mated: '+(mate?'yes':'no')+
      '; safe rook: '+(v.safeRook?'yes':'no')+'; legal reply exists: '+(legal>0?'yes':'no')+'.'),
    step('Strong to move ⇒ MateWithin(97)','For a legal nonterminal fresh-clock position, the proof gives mate in at most 97 plies against all responses.'),
    step('Weak to move ∧ SafeRook ∧ Reply ⇒ MateWithin(98)','For a winning weak-turn root, mate is forced within 98 plies; both bounds fit the 50-move rule.'),
    step('¬Winσ(p) ⇒ Draw','An unsafe rook may be captured, leaving KK, or the position is stalemate. The class outcome is proved; a JavaScript move policy is not yet certified.')
   ],
   formal:immediate?'KRKImmediate.immediate_iff; KRKCentral.fresh_outcome':'KRKCentral.fresh_outcome',
   ...(immediate?{auxSource:'EC-T0049',auxSourceUrl:krkRoot+'theorems/frozen/EC-T0049/v1.md'}:{})
  };
 }
 return null;
}

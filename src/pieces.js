/**
 * Original in-repository chess silhouettes. No third-party sprite, font, or remote image.
 * A single 100x100 viewBox prevents intrinsic piece metrics from affecting grid tracks.
 */
const shapes = Object.freeze({
  K: '<path d="M50 8v26M38 20h24" fill="none" stroke-width="6" stroke-linecap="round"/><path d="M42 34c-12 4-17 14-13 22l7 8-4 9h36l-4-9 7-8c4-8-1-18-13-22z"/><path d="M35 56h30M39 65h22" fill="none" stroke-width="3"/><path d="M29 73h42l5 8H24zM20 83h60v7H20z"/>',
  Q: '<path d="M19 31 28 63 72 63 81 31 64 48 50 22 36 48z"/><circle cx="19" cy="27" r="5"/><circle cx="50" cy="18" r="5"/><circle cx="81" cy="27" r="5"/><path d="M28 66h44l6 10H22zM23 77h54l4 9H19z"/>',
  P: '<circle cx="50" cy="29" r="13"/><path d="M39 42Q32 50 34 61L28 70h44l-6-9q2-11-5-19z"/><path d="M27 72h46l6 14H21z"/>',
  B: '<path d="M48 13c-4 8-18 22-18 35 0 12 9 19 20 19s20-7 20-19c0-13-14-27-18-35z"/><path d="M55 29 39 49" fill="none" stroke-width="4"/><circle cx="50" cy="12" r="4"/><path d="M35 68h30l7 9H28z"/><path d="M25 77h50l4 9H21z"/>',
  N: '<path d="M31 76 24 61l-11-6 11-21 15-5 5-16 19 4 9 18-5 11-3 16 5 14z"/><path d="M40 29 56 47l-7 9M26 54l15 2" fill="none" stroke-width="3.5"/><circle cx="35" cy="39" r="3.3" class="piece-eye"/><path d="M25 76h48l5 10H20z"/>',
  R: '<path d="M22 18h12v10h10V18h12v10h10V18h12v24l-9 8v24H31V50l-9-8z"/><path d="M25 42h50M35 52h30" fill="none" stroke-width="3"/><path d="M27 73h46l6 13H21z"/>'
});
export function pieceSVG(piece) {
  if (!piece || !['w','b'].includes(piece[0]) || !shapes[piece[1]]) return '';
  return '<svg class="piece-icon piece-'+(piece[0]==='w'?'white':'black')+'" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true"><g class="piece-drawing" stroke-linejoin="round" stroke-linecap="round">'+shapes[piece[1]]+'</g></svg>';
}
export function pieceLabel(piece) {
  const name={K:'king',Q:'queen',P:'pawn',B:'bishop',N:'knight',R:'rook'};
  return piece ? (piece[0]==='w'?'white ':'black ')+name[piece[1]] : 'empty';
}

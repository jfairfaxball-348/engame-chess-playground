/** Board presentation geometry: a1=0, h8=63. Pure helpers for pointer and UI tests. */
export function squareForCell(row,col,orientation) {
  if(!Number.isInteger(row)||!Number.isInteger(col)||row<0||row>7||col<0||col>7) return -1;
  return orientation==='b' ? row*8+(7-col) : (7-row)*8+col;
}
export function squareAtPoint(rect,clientX,clientY,orientation) {
  const size=Math.min(rect.width,rect.height);
  if(!(size>0)||clientX<rect.left||clientY<rect.top||clientX>=rect.left+size||clientY>=rect.top+size) return -1;
  return squareForCell(Math.floor((clientY-rect.top)/size*8),Math.floor((clientX-rect.left)/size*8),orientation);
}

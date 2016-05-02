'use babel';
// utility for moving a point..

export default function pointMove(p, n, editor) {
  const steps = Math.abs(n),
    pClone = p.copy();
  if (n < 0)
    return movePointBack(pClone, steps, editor);

  return movePointFront(pClone, steps, editor);
}
function movePointFront(p, counter, e) {
  const lastRow = e.getLastBufferRow();
  while (counter--) {
    let colLimit = e.lineTextForBufferRow(p.row).length;
    if (p.column + 1 <= colLimit) {
      p.column++;
      continue;
    }
    if (p.row + 1 <= lastRow) {
      p.row++;
      p.column = 0;
      colLimit = e.lineTextForBufferRow(p.row).length;
      continue;
    }
    break;
  }
  return p;
}
function movePointBack(p, counter, e) {
  while (counter-- >= 0) {
    if (p.column - 1 >= 0) {
      p.column--;
      continue;
    }
    if (p.row - 1 >= 0) {
      p.row--;
      p.column = e.lineTextForBufferRow(p.row).length;
      continue;
    }
    break; // we should be at origin
  }
  return p;
}

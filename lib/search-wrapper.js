'use babel';
//custom search utility
import { Point, Range } from 'atom';

export default function searchForFrom(item, point, opt, extra, editor) {
  let start;

  if (extra && extra.newline)
    item = `(\n)?${item}(\n)?`;
  if (extra && extra.tab)
    item = `(\t)?${item}`;
  const cb = opt && opt.cb;
  const range = rangePointToLimit(point, opt);
  const args = [
    new RegExp(escapeRegExp(item)),
    range,
    cb
  ];

  if (opt && opt.back)
    editor.backwardsScanInBufferRange.apply(editor, args);
  else
    editor.scanInBufferRange.apply(editor, args);

  return start;
}
// utility of searchForFrom()
function rangePointToLimit(p, opt) {
  const limit = (opt && opt.back) ? Point.ZERO : Point.INFINITY;
  return new Range(limit, [p.row, p.column]);
}
// utility of searchForFrom()
function escapeRegExp(str) {
  const specialChar = ['*'];
  let res = '';
  specialChar.forEach(x => {
    res = str.replace(x, m => `\\${m}`);
  });
  return res;
}

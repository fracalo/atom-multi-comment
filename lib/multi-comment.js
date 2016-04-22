'use babel';
/* global atom */
import langs from './multi-comment-langs';
import { CompositeDisposable } from 'atom';


export default class {
  constructor() {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'multi-comment:toggle': () => this.toggle()
    }));
    atom.workspace.onDidChangeActivePaneItem(e => { this.defineLang(e);});
    this.defineLang();
  }
  defineLang(e) {
    this.editor = e || atom.workspace.getActiveTextEditor();
    this.lang = langs.filter(x => x.test(this.editor.getGrammar().scopeName))[0];
    this.workspaceEl = atom.views.getView(this.editor);
  }
  isCommented(ref) {
    let points = (ref.start.isEqual(ref.end)) ?
    [
      { type: 'cursor', p: ref.start }
    ] : [
      { type: 'start', p: ref.start },
      { type: 'end', p: ref.end }
    ];

    points = points.reduce((ac, x) => {
      x.descriptor = this.editor.scopeDescriptorForBufferPosition(x.p);
      if (x.descriptor.scopes.some(z => {
        const res = z.match(/comment/);
        if (res)
          x.commentType = (z.match(/block/)) ? 'block' : 'line';
        return res;
      }))
        ac.push(x);
      return ac;
    }, []);

    return points.length && points;
  }
  toggle() {
    if (!this.editor)
      return;
    const range = this.editor.getSelectedBufferRange(),
      lineisCommented = this.isCommented(range);

    console.log(this.editor);

    if (! lineisCommented)
      this.addComment();
    else
      // do we need to transact ?
      lineisCommented.forEach((x) => this.unComment(x));

    console.log('lineisCommented', lineisCommented);
  }
  unComment(o) {
    if (! this[`unComment${o.commentType}`])
      throw new Error(`no method for commentType : ${o.commentType}`);
    this[`unComment${o.commentType}`](o);
  }
  unCommentline(o) {
    console.log('unCommentline', o);
    const cursor = this.editor.getCursorBufferPosition();
    this.editor.setCursorBufferPosition(o.p);
    console.log('this.workspaceEl', this.workspaceEl.dispatch);
    atom.commands.dispatch(this.workspaceEl, 'editor:toggle-line-comments');
    this.editor.setCursorBufferPosition(cursor);
  }
  unCommentBlock(o) {
    console.log('unCommentblock')
  }
  addComment() {
    const range = this.editor.getSelectedBufferRange();
    const text = this.editor.getTextInBufferRange(range);
    const [open, close] = [this.lang.commentTokens.open, this.lang.commentTokens.close];
    this.editor.setTextInBufferRange(range, `${open}${text}${close}`);

    // set cursor position
    const defPosition = this.editor.getCursorBufferPosition();
    defPosition.column -= 2;
    this.editor.setCursorBufferPosition(defPosition);
  }
  deactivate() {
    this.subscriptions.dispose();
  }
  destroy() {}
  // escapeRegExp(str) {
  //   const specialChar = ['*'];
  //   let res = '';
  //   specialChar.forEach(x => {
  //     res = str.replace(x, m => `\\${m}`);
  //   });
  //   return res;
  // }
  // singleCommentedLine() {
  //   const singleCommentTok =
  //   this.searchForFrom(
  //     Object.keys(this.lang.commentTokens).map(x => this.lang.commentTokens[x]),
  //     null,
  //     { back: true }
  //   );
  //
  //   if (singleCommentTok && singleCommentTok[0] === '//')
  //     return singleCommentTok;
  // }
  // followingOpenTokenOnLine() {
  //   console.log('hellow form followingOpenTokenOnLine');
  //   const firstFollowingTok =
  //   this.searchForFrom(
  //     Object.keys(this.lang.commentTokens).map(x => this.lang.commentTokens[x]),
  //     null,
  //     null
  //   );
  //
  //   if (firstFollowingTok && firstFollowingTok[0] === '/*')
  //     return firstFollowingTok;
  // }
  // precedingCloseTokenOnLine() {
  //   console.log('(this.lang.commentTokens)', this.lang);
  //
  //   const firstPrecedingTok =
  //   this.searchForFrom(
  //     Object.keys(this.lang.commentTokens).map(x => this.lang.commentTokens[x]),
  //     null,
  //     { back: true }
  //   );
  //
  //   if (firstPrecedingTok && firstPrecedingTok[0] === '*/')
  //     return firstPrecedingTok;
  // }
  // searchForFrom(arrStr, point, opt) {
  //   let start;
  //
  //   const range = this.selectRange(point, opt); // if point is null the range is the current line
  //   const args = [
  //     new RegExp(arrStr.map(this.escapeRegExp).join('|')),
  //     range,
  //     e => e.stop(start = e.match)
  //   ];
  //
  //   if (opt && opt.back)
  //     this.editor.backwardsScanInBufferRange.apply(this.editor, args);
  //   else
  //     this.editor.scanInBufferRange.apply(this.editor, args);
  //
  //   return start;
  // }
  // selectRange(p, opt) {
  //   let range = this.editor.getSelectedBufferRange();
  //
  //   if (!p) {
  //     const len = this.editor.lineTextForBufferRow(range.start.row).length;
  //     const currCol = (opt && opt.back) ? range.start.column : range.end.column;
  //     if (opt && opt.back)
  //       return new Range([range.start.row, 0], [range.start.row, currCol]);
  //
  //     return new Range([range.start.row, currCol], [range.start.row, len]);
  //   }
  //
  //   if (range.isEmpty())
  //     range = new Range(new Point(0, 0), [p.row, p.column]);
  //   return range;
  // }
  // searchStartComment(point) {
  //   let start;
  //
  //   const range = this.selectRange(point);
  //
  //   this.editor.backwardsScanInBufferRange(
  //     this.lang.commentTokens.open,
  //     range,
  //     e => e.stop(start = e.match)
  //   );
  //
  //   return start;
  // }
}

'use babel';
/* global atom */
import langs from './multi-comment-langs';
import pointMove from './point-move';
import { CompositeDisposable, Point, Range } from 'atom';


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
    const scope = this.editor.getGrammar().scopeName;
    this.lang = langs.filter(x => x.test(scope))[0];
    this.workspaceEl = atom.views.getView(this.editor);
  }
  isCommented(ref) {
    let points = ref instanceof Point ?
    [
      { type: 'cursor', p: ref }
    ] :
    (ref.start.isEqual(ref.end)) ?
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

    if (! lineisCommented) {
      this.editor.transact(() => {
        if (this.lang.commentTokens.option && this.lang.commentTokens.option.scanInside)
          this.uncommentInsideRange(range);
        this.addComment();
      });
    }
    else {
      this.editor.transact(() => {
        lineisCommented.forEach((x) => this.unComment(x));
      });
    }
  }
  uncommentInsideRange({ start, end }) {
    if (start.isEqual(end))
      return;

    if (start.isGreaterThan(end)) {
      [start, end] = [end, start];
    }
    while (start.isLessThan(end)) {
      start = pointMove(start, 1, this.editor);
      const commented = this.isCommented(start);
      if (commented)
        this.unComment(commented[0]);
    }
  }
  unComment(o) {
    if (! this[`unComment${o.commentType}`])
      throw new Error(`no method for commentType : ${o.commentType}`);
    this[`unComment${o.commentType}`](o);
  }
  unCommentline(o) {
    const cursor = this.editor.getCursorBufferPosition();
    this.editor.setCursorBufferPosition(o.p);
    atom.commands.dispatch(this.workspaceEl, 'editor:toggle-line-comments');
    this.editor.setCursorBufferPosition(cursor);
  }
  unCommentblock(o) {
    const cb = (e) => {
      e.stop();
      e.replace('');
    };
    this.followingToken('close', o.p, cb);
    this.precidingToken('open', o.p, cb);
  }
  addComment() {
    const range = this.editor.getSelectedBufferRange();
    const text = this.editor.getTextInBufferRange(range);
    const [open, close] =
    (this.lang.commentTokens.option && this.lang.commentTokens.option.newline) ?
      [`\n${this.lang.commentTokens.open}\n`, `\n${this.lang.commentTokens.close}\n`] :
    (this.lang.commentTokens.option && this.lang.commentTokens.option.tab) ?
      [`\t${this.lang.commentTokens.open}`, `\t${this.lang.commentTokens.close}`] :
      [this.lang.commentTokens.open, this.lang.commentTokens.close];

    this.editor.setTextInBufferRange(range, `${open}${text}${close}`);

    // set cursor position
    const landPosition = pointMove(this.editor.getCursorBufferPosition(), - (close.length - 1), this.editor);
    this.editor.setCursorBufferPosition(landPosition);
  }
  followingToken(type, point, cb) {
    const token = this.lang.commentTokens[`${type}`];
    const transPoint = pointMove(point, - (token.length - 1), this.editor);
    return this.searchForFrom(token, transPoint, { cb }, this.lang.commentTokens.option);
  }
  precidingToken(type, point, cb) {
    const token = this.lang.commentTokens[`${type}`];
    // move the point backward for the length of the token
    const transPoint = pointMove(point, token.length, this.editor);
    return this.searchForFrom(token, transPoint, { cb, back: true }, this.lang.commentTokens.option);
  }
  deactivate() {
    this.subscriptions.dispose();
  }
  destroy() {}
  searchForFrom(item, point, opt, extra) {
    let start;

    if (extra && extra.newline)
      item = `(\n)?${item}(\n)?`;
    if (extra && extra.tab)
      item = `(\t)?${item}`;
    const cb = opt && opt.cb;
    const range = this.rangePointToLimit(point, opt);
    const args = [
      new RegExp(this.escapeRegExp(item)),
      range,
      cb
    ];

    if (opt && opt.back)
      this.editor.backwardsScanInBufferRange.apply(this.editor, args);
    else
      this.editor.scanInBufferRange.apply(this.editor, args);

    return start;
  }
  // utility of searchForFrom()
  rangePointToLimit(p, opt) {
    const limit = (opt && opt.back) ? Point.ZERO : Point.INFINITY;
    return new Range(limit, [p.row, p.column]);
  }
  // utility of searchForFrom()
  escapeRegExp(str) {
    const specialChar = ['*'];
    let res = '';
    specialChar.forEach(x => {
      res = str.replace(x, m => `\\${m}`);
    });
    return res;
  }

}

'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import fs from 'fs';
import path from 'path';
import temp from 'temp';

// import multilineJsComment from '../lib/multi-comment';
// const MJSCinstance = new multilineJsComment();

const testText = [
  'var a;',
  '\'use babel\';',
  '// let magic = (a) =>{ log(42); return log(x);}',
  '/* *****  ',
  ' "test";  ',
  ' ****** */'
];

describe('Multi Comment - JS', () => {
  let workspaceElement,
    editor,
    activation = {},
    directory,
    filepath;

  beforeEach(() => {
    directory = temp.mkdirSync();
    atom.project.setPaths(directory);
    workspaceElement = atom.views.getView(atom.workspace);
    filepath = path.join(directory, 'test.js');
    fs.writeFileSync(filepath, testText.join('\n'));
    // fs.writeFileSync(path.join(directory, 'sample.js'), 'var a;\n');

    waitsForPromise(() => atom.packages.activatePackage('language-javascript'));
    waitsForPromise(() => atom.workspace.open(filepath).then((e) => editor = e));

    activation.MJSC = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.MJSC)
  });

  describe('check language-javascript', () => {
    it('opens a file', () => {
      expect(editor.getPath()).toContain('test');
      expect(editor.getGrammar().scopeName).toBe('source.js');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    });
  });
  describe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/**/var a;');
    });
    it('when nothing is selected and multiline-close-comment-token at beginning of line', () => {
      editor.setTextInBufferRange([[0, 0], [0, 0]], '/* ciao */');
      editor.setCursorBufferPosition([0, 16]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/* ciao */var a;/**/');
    });
    it('when nothing is selected and multiline-open-comment-token at end of line', () => {
      editor.setTextInBufferRange([[0, 6], [0, 6]], '/* ciao */');
      editor.setCursorBufferPosition([0, 0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/**/var a;/* ciao */');
    });

    it('to selected when no comment in sight', () => {
      editor.setTextInBufferRange([[0, 6], [0, 6]], '/* ciao */');
      editor.setSelectedBufferRange([[0, 0], [0, 3]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/*var*/ a;/* ciao */');
    });
    it('to selected when multiline-close-comment-token at beginning of line', () => {
      editor.buffer.lines[1] = 'let test = (a) =>{ log(42)/*return log(x)*/ return a;}';
      editor.setSelectedBufferRange([[1, 44], [1, 53]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe('let test = (a) =>{ log(42)/*return log(x)*/ /*return a;*/}');
    });
    it('to selected when multiline-open-comment-token at end of line', () => {
      editor.buffer.lines[1] = 'let test = (a) =>{ log(42)/*return log(x)*/ return a;}';
      editor.setSelectedBufferRange([[1, 0], [1, 10]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe('/*let test =*/ (a) =>{ log(42)/*return log(x)*/ return a;}');
    });
  });
  describe('uncomment', () => {
    it('a single-line-comment', () => {
      editor.setTextInBufferRange([[2, 0], [2, 49]], '// "magic is in the air"');
      editor.setCursorBufferPosition([2, 10]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[2]).toBe('"magic is in the air"');
    });
    it('a block-comment on one line', () => {
      editor.setTextInBufferRange([[2, 0], [2, 49]], '/* "magic is in the air" */');
      editor.setCursorBufferPosition([2, 10]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[2]).toBe(' "magic is in the air" ');
    });
    it('a block-comment on multiple lines', () => {
      editor.setCursorBufferPosition([3, 6]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[3]).toBe(' *****  ');
      expect(editor.buffer.lines[4]).toBe(' "test";  ');
      expect(editor.buffer.lines[5]).toBe(' ****** ');
    });
    it('a block-comment on multiple lines variant1', () => {
      editor.setTextInBufferRange([[3, 2], [3, 2]], '//');
      editor.setCursorBufferPosition([4, 6]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[3]).toBe('// *****  ');//  ->  '/*// *****  '
      expect(editor.buffer.lines[4]).toBe(' "test";  ');
      expect(editor.buffer.lines[5]).toBe(' ****** ');
    });
    it('a block-comment on multiple lines variant2', () => {
      editor.setTextInBufferRange([[4, 0], [4, 0]], '//');
      editor.setCursorBufferPosition([4, 6]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[3]).toBe(' *****  ');//  ->  '/*// *****  '
      expect(editor.buffer.lines[4]).toBe('// "test";  ');
      expect(editor.buffer.lines[5]).toBe(' ****** ');
    });
  });
});

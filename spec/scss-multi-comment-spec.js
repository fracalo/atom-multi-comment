'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import fs from 'fs';
import path from 'path';

xdescribe('Multi Comment - coffeescript', () => {
  let workspaceElement,
    editor,
    activation = {};

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'test-files')]);

    waitsForPromise(() => atom.packages.activatePackage('language-coffee-script'));
    waitsForPromise(() => atom.workspace.open('file.coffee').then((e) => editor = e));

    activation.multiComment = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.multiComment);
  });

  describe('check language', () => {
    it('opens a file', () => {
      expect(editor.getGrammar().scopeName).toBe('source.coffee');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    })
  })
  describe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      console.log('lines[0]', editor.buffer.lines[0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('\t###\t###ts = -> 42');
    })
    it('when command is run twice return to original', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('\tts = -> 42');

    })
    it('when multiline selected', () => {
      editor.setSelectedBufferRange([[4, 0], [5, 12]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('\t###unless cat > ts()');
      expect(editor.buffer.lines[5]).toBe('  cat = ts()\t###');
    })
    it('to selected partial lines', () => {
      editor.setSelectedBufferRange([[11, 5], [11, 11]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[11]).toBe(' 10, \t###20, 30\t###');
    })
    it('to selected single lines', () => {
      editor.setSelectedBufferRange([[11, 0], [11, 11]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[11]).toBe('\t### 10, 20, 30\t###');
    })
  })
  describe('uncomment', () => {
    it('a block-comment', () => {
      editor.setCursorBufferPosition([7, 10]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[7]).toBe(' console.log cat');
    });
    it('a line-comment', () => {
      editor.setCursorBufferPosition([8, 19]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[8]).toBe('another comment');
    });
  });
});

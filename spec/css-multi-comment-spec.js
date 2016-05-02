'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import fs from 'fs';
import path from 'path';

describe('Multi Comment - css ', () => {
  let workspaceElement,
    editor,
    activation = {};

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'test-files')]);

    waitsForPromise(() => atom.packages.activatePackage('language-css'));
    waitsForPromise(() => atom.workspace.open('file.css').then((e) => editor = e));

    activation.multiComment = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.multiComment);
  });

  xdescribe('check language', () => {
    it('opens a file', () => {
      expect(editor.getGrammar().scopeName).toBe('source.css');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    })
  })
  xdescribe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      console.log('lines[0]', editor.buffer.lines[0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/**/section{');
    })
    it('when command is run twice return to original', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('section{');

    })
    it('when multiline selected', () => {
      editor.setSelectedBufferRange([[4, 0], [5, 18]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('/*figure{');
      expect(editor.buffer.lines[5]).toBe('  background:#000;*/');
    })
    it('to selected partial lines', () => {
      editor.setSelectedBufferRange([[1, 30], [1, 42]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe('  color:red; /*height:10px;*/ /*border:white*/');
    })
    it('to selected single lines', () => {
      editor.setSelectedBufferRange([[5, 0], [5, 18]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[5]).toBe('/*  background:#000;*/');
    })
  })
  xdescribe('uncomment', () => {
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
  describe('if it comments a block that has inside comment', () => {
    it('it will uncomment these first', () => {
      editor.setSelectedBufferRange([[4, 0], [7, 1]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('/*figure{');
      expect(editor.buffer.lines[5]).toBe('  background:#000;');
      expect(editor.buffer.lines[6]).toBe('  height:auto');
      expect(editor.buffer.lines[7]).toBe('}*/');
    });
  });
});

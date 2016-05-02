'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import path from 'path';

describe('Multi Comment - C', () => {
  let workspaceElement,
    editor,
    activation = {};

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'test-files')]);

    waitsForPromise(() => atom.packages.activatePackage('language-c'));
    waitsForPromise(() => atom.workspace.open('file.c').then((e) => editor = e));

    activation.multiComment = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.multiComment);
  });

  describe('check language', () => {
    it('opens a file', () => {
      expect(editor.getGrammar().scopeName).toBe('source.c');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    });
  });
  describe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('/**/#include <stdio.h>');
    });
    it('when command is run twice return to original', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('#include <stdio.h>');
    });
    it('when multiline selected', () => {
      editor.setSelectedBufferRange([[8, 0], [9, 12]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[8]).toBe('/*  int lower;');
      expect(editor.buffer.lines[9]).toBe('  lower = 0;*/ /* lower limit of temperature table */');
    });
    it('to selected partial lines', () => {
      editor.setSelectedBufferRange([[7, 7], [7, 13]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[7]).toBe('  int  /*upper,*/ step;');
    });
    it('to selected single lines', () => {
      editor.setSelectedBufferRange([[6, 0], [6, 17]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[6]).toBe('/*  double celsius;*/');
    });
  });
  describe('uncomment', () => {
    it('a block-comment', () => {
      editor.setCursorBufferPosition([1, 0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe(' print Fahrenheit-Celsius table');
      expect(editor.buffer.lines[2]).toBe('for fahr = 0, 20, ..., 300 ');
    });
    it('a line-comment', () => {
      editor.setCursorBufferPosition([9, 20]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[9]).toBe('  lower = 0;  lower limit of temperature table ');
    });
  });
});

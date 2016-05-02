'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import fs from 'fs';
import path from 'path';

describe('Multi Comment - Ruby', () => {
  let workspaceElement,
    editor,
    activation = {};

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'test-files')]);

    waitsForPromise(() => atom.packages.activatePackage('language-ruby'));
    waitsForPromise(() => atom.workspace.open('file.rb').then((e) => editor = e));

    activation.multiComment = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.multiComment);
  });

  describe('check language', () => {
    it('opens a file', () => {
      expect(editor.getGrammar().scopeName).toBe('source.ruby');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    });
  });
  describe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('');
      expect(editor.buffer.lines[1]).toBe('=begin');
      expect(editor.buffer.lines[3]).toContain('=end');
    });
    it('when command is run twice return to original', () => {
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[0]).toBe('5.times { print "Odelay!" }');
    });
    it('when multiline selected', () => {
      editor.setSelectedBufferRange([[2, 0], [3, 40]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[3]).toBe('=begin');
      expect(editor.buffer.lines[4]).toBe('  {"make"=>"nissan", "model"=>"altima"},');
      expect(editor.buffer.lines[5]).toBe('  {"make"=>"nissan", "model"=>"maxima"},');
      expect(editor.buffer.lines[6]).toBe('=end');
    });

    it('to selected partial lines', () => {
      editor.setSelectedBufferRange([[3, 21], [3, 38]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('=begin');
      expect(editor.buffer.lines[5]).toBe('"model"=>"maxima"');
      expect(editor.buffer.lines[6]).toBe('=end');
    });
    it('to selected single lines', () => {
      editor.setSelectedBufferRange([[3, 0], [3, 40]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('=begin');
      expect(editor.buffer.lines[5]).toBe('  {"make"=>"nissan", "model"=>"maxima"},');
      expect(editor.buffer.lines[6]).toBe('=end');
    });
  });
  describe('uncomment', () => {
    it('a block-comment', () => {
      editor.setCursorBufferPosition([5, 0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[3]).toBe('  {"make"=>"nissan", "model"=>"maxima"},{"make"=>"nissan", "model"=>"juke"}');
    });
    it('a line-comment', () => {
      editor.setCursorBufferPosition([9, 10]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[9]).toBe('def hi(name)');
    });
  });
});

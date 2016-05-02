'use babel';
/* global atom  describe it expect beforeEach runs waitsForPromise spyOn */
import path from 'path';

fdescribe('Multi Comment - php', () => {
  let workspaceElement,
    editor,
    activation = {};

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    atom.project.setPaths([path.join(__dirname, 'test-files')]);

    waitsForPromise(() => atom.packages.activatePackage('language-php'));
    waitsForPromise(() => atom.workspace.open('file.php').then((e) => editor = e));

    activation.multiComment = atom.packages.activatePackage('multi-comment');
    atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    waitsForPromise(() => activation.multiComment);
  });

  describe('check language', () => {
    it('opens a file', () => {
      expect(editor.getGrammar().scopeName).toBe('text.html.php');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
    });
  });
  describe('adds comment', () => {
    it('when nothing is selected and no comment in sight', () => {
      editor.setCursorBufferPosition([1, 0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe("/**/    $Name ='franky';");
    });
    it('when command is run twice return to original', () => {
      editor.setCursorBufferPosition([1, 0]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe("    $Name ='franky';");
    });
    it('when multiline selected', () => {
      editor.setSelectedBufferRange([[1, 0], [2, 21]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[1]).toBe("/*    $Name ='franky';");
      expect(editor.buffer.lines[2]).toBe('    print "<html>\\n";*/');
    });
    it('to selected partial lines', () => {
      editor.setSelectedBufferRange([[4, 40], [4, 58]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[4]).toBe('    print "<p>Welcome, $Name</P>\\n";    /*print "</body>\\n";*/');
    });
    it('to selected single lines', () => {
      editor.setSelectedBufferRange([[5, 0], [5, 22]]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[5]).toBe('/*    print "</html>\\n";*/');
    });
  });
  describe('uncomment', () => {
    it('a block-comment', () => {
      editor.setCursorBufferPosition([7, 24]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[7]).toBe('    function add: float($a, $b){');
    });
    it('a line-comment', () => {
      editor.setCursorBufferPosition([10, 19]);
      atom.commands.dispatch(workspaceElement, 'multi-comment:toggle');
      expect(editor.buffer.lines[10]).toBe('    $z = add(3,3)');
    });
  });
});

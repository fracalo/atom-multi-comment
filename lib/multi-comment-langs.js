'use babel';

const languages = [
  {
    name: 'coffeescript',
    test: /^source\.coffee\.?/,
    openToken: '###',
    closeToken: '###',
    /* when used at line start line-scoprDescriptor will override
    so we cheat with leading \t */
    option: { tab: '\\t' }
  },
  {
    name: 'javascript',
    test: /^source\.js\.?/,
    openToken: '/*',
    closeToken: '*/'
  },
  {
    name: 'java',
    test: /^source\.java\.?/,
    openToken: '/*',
    closeToken: '*/'
  },
  {
    name: 'css',
    test: /^source\.css\.?/,
    openToken: '/*',
    closeToken: '*/',
    option: { scanInside: true }
  },
  {
    name: 'php',
    test: /^source\.php\.?/,
    openToken: '/*',
    closeToken: '*/'
  },
  {
    name: 'ruby',
    test: /^source\.ruby\.?/,
    openToken: '=begin',
    closeToken: '=end',
    option: { newline: '\\n' }
  },
  {
    name: 'c',
    test: /^source\.c\.?/,
    openToken: '/*',
    closeToken: '*/'
  }

  // {
  //   name: 'python',
  //   test: /^source\.python\.?/,
  //   openToken: '\'\'\'',
  //   closeToken: '\'\'\''
  // }
  // {
  //   name: 'bash',
  //   test: /^source\.python\.?/,
  //   openToken: '\'\'\'',
  //   closeToken: '\'\'\''
  // }
  // {
  //   name: 'sass',
  //   test: /^source\.python\.?/,
  //   openToken: '\'\'\'',
  //   closeToken: '\'\'\''
  // }
];
const langMap = (rLangScope, openCommentToken, closeCommentToken, o) => ({
  test: (scope) => rLangScope.test(scope),
  commentTokens: {
    open: openCommentToken,
    close: closeCommentToken,
    option: o
  }
});

export default languages.map(x => langMap(x.test, x.openToken, x.closeToken, x.option));

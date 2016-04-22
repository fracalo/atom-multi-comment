'use babel';

const languages = [
  {
    name: 'javascript',
    grammarTest: /^source\.js\.?/,
    openToken: '/*',
    closeToken: '*/'
  },
  {
    name: 'css',
    grammarTest: /^source\.css\.?/,
    openToken: '/*',
    closeToken: '*/'
  },
  {
    name: 'php',
    grammarTest: /^source\.php\.?/,
    openToken: '/*',
    closeToken: '*/'
  }
];

const lang = (rLangScope, openCommentToken, closeCommentToken) => ({
  test: (scope) => rLangScope.test(scope),
  commentTokens: {
    open: openCommentToken,
    close: closeCommentToken
  }
});

export default languages.map(x => lang(x.grammarTest, x.openToken, x.closeToken));

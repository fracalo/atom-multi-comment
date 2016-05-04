[![Build Status](https://travis-ci.org/fracalo/atom-multi-comment.svg?branch=master)](https://travis-ci.org/fracalo/atom-multi-comment)

# Atom - Multi-comment

a block-comment module built with the focus to interact with the default line-comment-command.

## Installation
```
 apm install multi-comment
```
## Command / Keymap
  `multi-comment:toggle`  : `ctrl` + `alt` + `7`

## Languages currently supported are:
 - JS
 - CoffeeScript
 - PHP (mixed content not implemented)
 - C
 - Ruby
 - Css
 - Scss

### to come:

possibly all language-grammars supporting block-comments scopeDescriptors.

## Specs:
 - when both a selection's start/end point aren't commented it comments selection with block-comment tokens.
 - when one or both a selection's start/end point are in a commented scope, these get uncommented.
 - in atom, languages that don't support line comments use block comments for the default line comment command (for ex. check CSS); with these language-types,  when a comment is found inside the selection, the Multi-block-comment will uncomment any inside block-comments and comment the whole block selection.

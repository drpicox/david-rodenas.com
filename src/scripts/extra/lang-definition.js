try {

PR['registerLangHandler'](
  PR['createSimpleLexer'](
     // Shortcut patterns.
     [
      // The space production <s>
      //      [PR['PR_COMMENT'],     /^;[^\n\r]*/, null, ';'],
      ],
     // Fall-through patterns.
     [
      [PR['PR_LITERAL'], /^:[\w]+/],
      [PR['PR_KEYWORD'], /^([\n\r]([\w]+))|(GET)|(PUT)|(POST)|(DELETE)/, /\w/],
      [PR['PR_COMMENT'], /^#[^\n\r]*/],
      ]),
  ['definition']);

} catch (err) {}
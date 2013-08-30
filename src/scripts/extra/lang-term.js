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
      [PR['PR_LITERAL'], /^[$][\w]+/],
      [PR['PR_PUNCTUATION'], /[$][\s]/],
      [PR['PR_PUNCTUATION'], /^[\?\&\\\!]/],
      [PR['PR_KEYWORD'], /^(cd|curl|export|gem|git|heroku|sudo|unzip|wget|grunt|bower|yo|npm|node|mkdir|apt-get|add-apt-repository)(\s|$)/],
      [PR['PR_STRING'], /^[0-9]+/],
      [PR['PR_STRING'], /^[`][^`]*[`]/],
      [PR['PR_STRING'], /^[\"][^\"]*[\"]/],
      [PR['PR_STRING'], /^[\'][^\']*[\']/],
      [PR['PR_STRING'], /^[\n\r][^$][^\n\r]*/],
      [PR['PR_COMMENT'], /^#[^\n\r]*/],
      ]),
  ['term']);

} catch (err) {}

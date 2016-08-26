var makeFalafelTransform = require('browserify-transform-tools').makeFalafelTransform;
var minify = require('html-minifier').minify;

/*  
  https://tonicdev.com/npm/acorn
  var parse = require('acorn').parse;
  ({ 
    prop: parse('a={template: "<some></some>" };'),
    ass: parse('X.template = "<some></some>";'),
  })

*/
var options = {excludeExtensions: [".json",".html"]};
module.exports = makeFalafelTransform('template-min', options, function(node, transformOptions, done) {

  if (node.type === 'Property' 
      && node.key.name === 'template' 
      && node.value.type === 'Literal') {
      
    node.value.update(JSON.stringify(min(node.value.value)));

  } if (node.type === 'AssignmentExpression'
      && node.left.type === 'MemberExpression'
      && node.left.property.type === 'Identifier'
      && node.left.property.name === 'template'
      && node.right.type === 'Literal') {

    node.right.update(JSON.stringify(min(node.right.value)));
  }

  done();
});

function min(text) {
  return minify(text, {
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    sortAttributes: true,
    sortClassName: true,
  });
}

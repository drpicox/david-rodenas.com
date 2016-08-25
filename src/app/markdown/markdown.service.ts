const marked = require('marked');
const Prism = require('prismjs');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-java');
require('prismjs/components/prism-json');
require('prismjs/components/prism-less');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-scss');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-yaml');

export class MarkdownService {

  constructor() {
    marked.setOptions({
      highlight: function (code, language) {
        if (!Prism.languages[language || 'clike']) {
          console.debug('language not found: "'+language+'"');
          language = 'clike';
        }
        return Prism.highlight(code, Prism.languages[language || 'clike']);
      }
    });
  }

  toHtml(text: string): string {
    var withoutFrontmatter = removeFrontmatter(text);
    var html = marked(withoutFrontmatter);
    html = openLinksInBlank(html);
    return html;
  }

} 

function openLinksInBlank(text: string): string {
  return text.replace(/<a href="http/g, '<a target="_blank" href="http');
}

function removeFrontmatter(text: string): string {
  return text.replace(/^---\n[\s\S]*\n---\n/, '');
}


const Prism = require('prismjs');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-java');
require('prismjs/components/prism-json');
require('prismjs/components/prism-less');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-scss');
require('prismjs/components/prism-typescript');
require('prismjs/components/prism-yaml');

export class HighlightService {

  constructor() {
  }

  highlight(code: string, language: string): string {
      if (!Prism.languages[language || 'clike']) {
        console.debug('language not found: "'+language+'"');
        language = 'clike';
      }
      return Prism.highlight(code, Prism.languages[language || 'clike']);
  }  
}



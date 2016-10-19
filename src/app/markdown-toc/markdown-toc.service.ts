const marked = require('marked');

import { Toc } from './';

export class MarkdownTocService {

  /* @ngInject */
  constructor() {}

  toToc(text: string): Toc {
    let toc = new Toc();

    let renderer = new marked.Renderer();
    Object.keys(marked.Renderer.prototype).forEach(k => renderer[k] = s => '');
    renderer.heading = (text, level, raw) => {
      let hash = raw.toLowerCase().replace(/[^\w]+/g, '-');
      toc.headings.push({text: raw, level, hash});
    }

    let x = marked(text, {renderer});
    console.log(x);
    
    return toc;
  }

}


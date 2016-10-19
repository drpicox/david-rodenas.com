const marked = require('marked');

import { HighlightService } from '../highlight';

export class MarkdownService {

  /* @ngInject */
  constructor(
    private highlightService: HighlightService
  ) {}

  toHtml(text: string): string {
    var withoutFrontmatter = removeFrontmatter(text);
    var html = marked(withoutFrontmatter, {
      highlight: (code, lang) => this.highlightService.highlight(code, lang)
    });
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


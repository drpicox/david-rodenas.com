import { AsyncScriptsService } from '../tools';
import { HighlightService } from '../highlight';

export class MarkdownService {

  /* @ngInject */
  constructor(
    private asyncScriptsService: AsyncScriptsService,
    private highlightService: HighlightService
  ) {}

  getRenderer(): angular.IPromise<any> {
    return this.getMarked().then((marked) => marked.Renderer);
  }

  toHtml(text: string, aOptions?: any): angular.IPromise<string> {
    return this.getMarked().then((marked) => {
      let options = aOptions || {};
      if (options.highlight === undefined) {
        options.highlight = (code, lang) => this.highlightService.highlight(code, lang);
      }

      var withoutFrontmatter = removeFrontmatter(text);
      var html = marked(withoutFrontmatter, options);
      html = openLinksInBlank(html);
      return html;
    });
  }

  private getMarked(): angular.IPromise<any> {
    return this.asyncScriptsService.
      load('node_modules/marked/lib/marked.js').
      then((exports) => exports.marked);
  }

}

function openLinksInBlank(text: string): string {
  return text.replace(/<a href="http/g, '<a target="_blank" href="http');
}

function removeFrontmatter(text: string): string {
  return text.replace(/^---\n[\s\S]*\n---\n/, '');
}


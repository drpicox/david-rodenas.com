import { AsyncScriptsService } from '../tools';
import { HighlightService } from '../highlight';

export class MarkdownService {

  /* @ngInject */
  constructor(
    private asyncScriptsService: AsyncScriptsService,
    private highlightService: HighlightService,
    private $q: angular.IQService
  ) {}

  getRenderer(): angular.IPromise<any> {
    return this.getMarked().then((marked) => marked.Renderer);
  }

  toHtml(text: string, aOptions?: any): angular.IPromise<string> {
    return this.getMarked().then((marked) => {
      let options = aOptions || {};
      if (options.highlight === undefined) {
        options.highlight = (code, lang, cb) => {
          this.highlightService.highlight(code, lang).
            then(result => cb(undefined, result), err => cb(err, undefined));
        };
      }

      return this.$q(function(resolve, reject) {
        let withoutFrontmatter = removeFrontmatter(text);
        let html = marked(withoutFrontmatter, options, (err, html) => {
          if (err) { return reject(err); }
          html = openLinksInBlank(html);
          resolve(html);
        });
      });
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


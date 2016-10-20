import { MarkdownService } from '../markdown';
import { Toc } from './';


export class MarkdownTocService {

  /* @ngInject */
  constructor(
    private markdownService: MarkdownService
  ) {}

  toToc(text: string): angular.IPromise<Toc> {
    return this.markdownService.getRenderer().then((Renderer) => {
      let toc = new Toc();

      let renderer = new Renderer();
      Object.keys(Renderer.prototype).forEach(k => renderer[k] = s => '');
      renderer.heading = (text, level, raw) => {
        let hash = raw.toLowerCase().replace(/[^\w]+/g, '-');
        toc.headings.push({text: raw, level, hash});
      }

      return this.markdownService.
        toHtml(text, {renderer}).
        then(() => toc);
    });
  }

}


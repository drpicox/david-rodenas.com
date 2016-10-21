import { AsyncScriptsService } from '../tools';

export interface HighlightService {
  highlight(code: string, language: string): angular.IPromise<string>;  
}

export type Highlighter = (code: string, language: string) => angular.IPromise<string>;

export class HighlightServiceProvider {

  private highlighterFactories = {} as {};

  addHighlighter(language: string, highlighterFactory) {
    this.highlighterFactories[language] = highlighterFactory;
  }

  /* @ngInject */
  $get(
    asyncScriptsService: AsyncScriptsService,
    $injector: angular.auto.IInjectorService
  ) {
    let highlighterFactories = this.highlighterFactories;
    let highlighters = {};
    return {highlight}

    function highlight(code: string, language: string): angular.IPromise<string> {
      let highlighter = getHighlighter(language);
      if (highlighter) {
        return highlighter(code, language);
      }

      return getPrism().then(Prism => {
        if (!Prism.languages[language || 'clike']) {
          console.debug('language not found: "'+language+'"');
          language = 'clike';
        }
        return Prism.highlight(code, Prism.languages[language || 'clike']);
      });
    }

    function getPrism(): angular.IPromise<any> {
      return asyncScriptsService.
        load('node_modules/prismjs/prism.js').
        then((exports) => exports.Prism);
    }

    function getHighlighter(language): any {
      if (!highlighters[language] && highlighterFactories[language]) {
        let factory = highlighterFactories[language];
        highlighters[language] = angular.isString(factory) ? $injector.get(factory) : $injector.invoke(factory);
      }

      return highlighters[language];
    }
  }

}



import { AsyncScriptsService } from '../tools';

export function nomnomlHighlighterFactory(
  asyncScriptsService: AsyncScriptsService,
) {
  return nomnomlHighlighter;

  function nomnomlHighlighter(code: string, language: string): angular.IPromise<string> {
    return getNomnoml().then(nomnoml => {
      let preElement = document.createElement('pre');
      let codeElement = document.createElement('code');
      preElement.className = 'language-nomnoml';
      codeElement.className = 'language-nomnoml';
      preElement.appendChild(codeElement);

      let result = nomnoml.renderSvg(code);
      let start = result.indexOf('>');
      result = result.slice(start + 1, -6);
      let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.innerHTML = result;
      codeElement.appendChild(svg);
      document.body.appendChild(preElement);
      let bbox = (svg as any).getBBox();
      let width = bbox.width + bbox.x*2;
      let height = bbox.height + bbox.y*2;
      document.body.removeChild(preElement);
      return `<svg width="${width}" height="${height}">${result}</svg>`;
    });
  }

  function getNomnoml(): angular.IPromise<any> {
    return asyncScriptsService.
      load('node_modules/nomnoml/nomnoml-dist.js').
      then((exports) => exports.nomnoml);
  }
}

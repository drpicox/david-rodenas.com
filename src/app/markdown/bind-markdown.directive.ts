import { MarkdownService } from './markdown.service';

/* @ngInject */
export function BindMarkdownDirective(markdownService: MarkdownService) {
  return {
    restrict: 'A',
    link: link,
  };

  function link(scope, element, attrs) {
    scope.$watch(attrs.appBindMarkdown, function(newText) {
      var html = markdownService.toHtml(newText || '');

      element.empty();
      element.html(html);
    });
  }
}

import { MarkdownService } from './markdown.service';

/* @ngInject */
export function BindMarkdownDirective(markdownService: MarkdownService) {
  return {
    restrict: 'A',
    link: link,
  };

  function link(scope, element, attrs) {
    var currentRequest;

    scope.$watch(attrs.appBindMarkdown, function(newText) {
      
      currentRequest = markdownService.toHtml(newText || '');
      var myRequest = currentRequest;
      
      myRequest.then((html) => {
        if (currentRequest !== myRequest) { return; }

        element.empty();
        element.html(html);
      });
    });
  }
}

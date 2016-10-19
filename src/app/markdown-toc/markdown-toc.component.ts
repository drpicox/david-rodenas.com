import { MarkdownTocService, Toc } from './';

export const MarkdownTocComponent = {
  bindings: {
    markdown: '<'
  },
  template: `
    <div class="toc-heading" 
      ng-repeat="heading in $ctrl.toc.headings track by $index" 
      ng-class="'level-' + heading.level"
      ng-click="$ctrl.scrollTo(heading.hash)"
      ng-bind="heading.text">          
    </div>
  `,
  controller: class MarkdownTocController {
    private toc: Toc;

    /* @ngInject */
    constructor(
      private markdownTocService: MarkdownTocService,
      private $anchorScroll: angular.IAnchorScrollService
    ) {}

    $onChanges(changesObj) {
      if (changesObj.markdown && changesObj.markdown.currentValue) {
        this.toc = this.markdownTocService.toToc(changesObj.markdown.currentValue);
      }
    }

    scrollTo(hash: string) {
      console.log(hash);
      this.$anchorScroll(hash);
    }
  }
};

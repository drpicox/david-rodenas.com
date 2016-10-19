export const PostTocComponent = {
  bindings: {
    body: '<',
  },
  template: `
    <div class="post-toc-title" ng-click="$ctrl.toggle()">
      In this post
      <small>
        <span ng-show="$ctrl.isVisible">hide</span>
        <span ng-hide="$ctrl.isVisible">show</span>
        table of contents
      </small>
    </div>
    <app-markdown-toc ng-if="$ctrl.isVisible" markdown="$ctrl.body"></app-markdown-toc>
  `,
  controller: class PostController {
    body: string;
    isVisible: boolean = false;
    constructor() {
    }

    toggle() {
      this.isVisible = !this.isVisible;
    }
  }
};

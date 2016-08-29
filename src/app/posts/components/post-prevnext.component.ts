import { Post } from '../services/post';

export class PostPrevNextComponent {
  static bindings = {
    post: '<',
  };
  static template = `
    <div class="layout-row">
      <a ng-if=" $ctrl.post.prev" href="#!/posts/{{$ctrl.post.prev.basename}}"
        class="rel-link layout-row flex">
          <span>←&nbsp;</span>
          <span class="flex">{{$ctrl.post.prev.title}}</span>
      </a> 
      <a ng-if="!$ctrl.post.prev" class="rel-link flex" href="#!/"><i class="fa fa-home"></i> HOME</a> 

      <a ng-if=" $ctrl.post.next" href="#!/posts/{{$ctrl.post.next.basename}}"
        class="rel-link layout-row flex">
          <span class="flex justify-right">{{$ctrl.post.next.title}}</span>
          <span>&nbsp;→</span>
      </a> 
      <a ng-if="!$ctrl.post.next" class="rel-link flex justify-right" href="#!/"><i class="fa fa-home"></i> HOME</a> 
    </div>
  `;
  static controller = PostPrevNextComponent;
  post: Post;
  constructor() {
  }
};

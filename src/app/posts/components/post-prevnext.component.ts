import { Post } from '../services/post';

export class PostPrevNextComponent {
  static bindings = {
    post: '<',
  };
  static template = `
    <div class="layout-row">
      <a ng-if=" $ctrl.post.prev" class="rel-link" href="#!/posts/{{$ctrl.post.prev.basename}}">← {{$ctrl.post.prev.title}}</a> 
      <a ng-if="!$ctrl.post.prev" class="rel-link" href="#!/"><i class="fa fa-home"></i> HOME</a> 
      <div class="flex"></div>
      <a ng-if=" $ctrl.post.next" class="rel-link" href="#!/posts/{{$ctrl.post.next.basename}}">{{$ctrl.post.next.title}} →</a> 
      <a ng-if="!$ctrl.post.next" class="rel-link" href="#!/"><i class="fa fa-home"></i> HOME</a> 
    </div>
  `;
  static controller = PostPrevNextComponent;
  post: Post;
  constructor() {
  }
};

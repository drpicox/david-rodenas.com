import { Post } from '../services/post';

export const PostsListComponent = {
  bindings: {
    posts: '<',
  },
  template: `
    <article ng-repeat="post in $ctrl.posts track by post.basename" itemscope itemtype="http://schema.org/BlogPosting" role="article">
      <a ng-href="#!/posts/{{post.basename}}" itemprop="url">
        <div class="icon"><i class="fa fa-file-text-o"></i></div>
        <h3 itemprop="name">{{post.title}}</h3>
        <app-tag-ids-list ids="post.tags"></app-tag-ids-list>
        <p>{{post.abstract}}</p>
        <div app-bind-markdown="post.snippet"></div>
        <small class="muted">
          <time datetime="{{ post.date }}">{{ post.date | date:'fullDate' }}</time>
        </small>
      </a>
    </article>
  `,
  controller: class PostsListController {
    posts: Post[];
  },
};

import { Post } from '../services/post';

export class PostsListComponent {
  static template = `
    <article ng-repeat="post in $ctrl.posts track by post.basename" itemscope itemtype="http://schema.org/BlogPosting" role="article">
      <a ng-href="#!/posts/{{post.basename}}" itemprop="url">
        <div class="icon"><i class="fa fa-file-text-o"></i></div>
        <h3 itemprop="name">{{post.title}}</h3>
        <small class="muted">
          <time datetime="{{ post.date }}">{{ post.date | date:'fullDate' }}</time>
        </small>
      </a>
    </article>
  `;
  static bindings = {
    posts: '<',
  };
  static controller = PostsListComponent;
};

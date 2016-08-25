import { Post } from '../services/post';

export class PostsRelatedsComponent {
  static template = `
    <h3>You might find interesting...</h3>
    <ul>
      <li ng-repeat="post in $ctrl.relateds track by post.basename">
        <a class="rel-link" ng-href="#!/posts/{{post.basename}}">{{post.title}}</a>
      </li>
      <li><a href="#!/">See all →</a></li>
    </ul>
  `;
  static bindings = {
    relateds: '<',
  };
  static controller = PostsRelatedsComponent;
};

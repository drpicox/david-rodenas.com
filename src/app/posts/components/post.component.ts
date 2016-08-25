import { Post } from '../services/post';

export class PostComponent {
  static bindings = {
    body: '<',
    post: '<',
  };
  static template = `
    <h1>{{$ctrl.post.title}}</h1>
    <p>{{$ctrl.post.abstract}}</p>
    <div app-bind-markdown="$ctrl.post.snippet"></div>
    <br>
    <div app-bind-markdown="$ctrl.body"></div>
  `;
  static controller = PostComponent;
  body: string;
  post: Post;
  constructor() {
  }
};

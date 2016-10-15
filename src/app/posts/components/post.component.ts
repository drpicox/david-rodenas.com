import { Post } from '../services/post';

export const PostComponent = {
  bindings: {
    body: '<',
    post: '<',
  },
  template: `
    <h1>{{$ctrl.post.title}}</h1>
    <br>
    <hr>
    <p>{{$ctrl.post.abstract}}</p>
    <div app-bind-markdown="$ctrl.post.snippet"></div>
    <hr>
    <br>
    <div app-bind-markdown="$ctrl.body"></div>
  `,
  controller: class PostController {
    body: string;
    post: Post;
    constructor() {
    }
  }
};

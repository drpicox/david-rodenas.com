import { Post } from '../services/post';

export class HomeComponent {
  static bindings = {
    posts: '<',
  };
  static template = `
    <section class="section">
      <main class="container" role="main">
        <h1>Latest blog posts</h1>
        <app-posts-list posts="$ctrl.posts"></app-posts-list>
      </main>
    </section>
  `;
  static controller = HomeComponent;
  posts: Post[];
  constructor() {
  }
};

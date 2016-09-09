import { Post } from '../services/post';

export const HomeComponent = {
  bindings: {
    posts: '<',
  },
  template: `
    <section class="section">
      <main class="container" role="main">
        <h1>Latest blog posts</h1>
        <app-posts-list posts="$ctrl.posts"></app-posts-list>
      </main>
    </section>
  `,
  controller: class HomeController {
    posts: Post[];
  }
};

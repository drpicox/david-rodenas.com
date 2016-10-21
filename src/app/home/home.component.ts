import { Post } from '../posts';
import { Tag } from '../tags';

export const HomeComponent = {
  bindings: {
    posts: '<',
    tags: '<'
  },
  template: `
    <section class="section">
      <main class="container" role="main">
        <h1>Latest blog posts</h1>
        <app-posts-list posts="$ctrl.posts"></app-posts-list>
        <br><br>
        <app-tag-cloud tags="$ctrl.tags"></app-tag-cloud>
      </main>
    </section>
  `,
  controller: class HomeController {
    posts: Post[];
    tags: Tag[];
  }
};

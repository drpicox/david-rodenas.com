import { PostsService } from '../services/posts.service';
import { RelatedPostsService } from '../services/related-posts.service';

/* @ngInject */
export function PostsXRouteConfig($routeProvider) {
  $routeProvider.when('/posts/:basename', {
    template: `
  <section class="section">
    <main class="container" role="main">
      <app-post body="$resolve.body" post="$resolve.post"></app-post>
      <br>
      <app-post-prevnext post="$resolve.post"></app-post-prevnext>  
      <br>
      <app-posts-relateds relateds="$resolve.relateds"></app-posts-relateds>  
    </main>
  </section>
      `,
    resolve: {
      body: /* @ngInject */ (postsService: PostsService, $route) => {
        return postsService.getBody($route.current.params.basename);
      },
      post: /* @ngInject */ (postsService: PostsService, $route) => {
        return postsService.get($route.current.params.basename);
      },
      relateds: /* @ngInject */ (postsService: PostsService, relatedPostsService: RelatedPostsService, $route) => {
        const post = postsService.get($route.current.params.basename);
        return relatedPostsService.get(post);
      },
    },
    title: '{{post.title}} - {{original}}',
    description: '{{post.abstract}}',
    keywords: 'drpicox,david,rodenas,{{post.tags.join(",")}},{{post.basename}}',
  });
}

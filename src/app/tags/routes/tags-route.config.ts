import { TagsService } from '../';
import { RelatedTagsService } from '../';

/* @ngInject */
export function TagsRouteConfig($routeProvider) {
  $routeProvider.when('/tags', {
    template: `
  <section class="section">
    <main class="large-container" role="main">
      <br><br>
      <app-tag-cloud tags="$resolve.tags"></app-tag-cloud>
      <br><br>
      <a href="#!/" class="rel-link">← See all posts</a> 
    </main>
  </section>
      `,
    resolve: {
      tags: /* @ngInject */ (tagsService: TagsService, $route) => {
        return tagsService.getAll();
      },
    },
    title: 'Tags - {{original}}',
    description: 'List of all tags in the blog',
    keywords: 'drpicox,david,rodenas,tags,tag-cloud',
  });
}

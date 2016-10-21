import { TagsService } from '../';
import { RelatedTagsService } from '../';

/* @ngInject */
export function TagsXRouteConfig($routeProvider) {
  $routeProvider.when('/tags/:id', {
    template: `
  <section class="section">
    <main class="large-container" role="main">
      <app-tag tag="$resolve.tag" tag-similarities="$resolve.similarities"></app-tag> 
    </main>
  </section>
      `,
    resolve: {
      tag: /* @ngInject */ (tagsService: TagsService, $route) => {
        return tagsService.get($route.current.params.id);
      },
      similarities: /* @ngInject */ (tagsService: TagsService, relatedTagsService: RelatedTagsService, $route) => {
        const tag = tagsService.get($route.current.params.id);
        return relatedTagsService.get(tag);
      },
    },
    title: '{{tag.id}} tag - {{original}}',
    description: 'Posts about {{tag.id}}',
    keywords: 'drpicox,david,rodenas,{{tag.id}}',
  });
}

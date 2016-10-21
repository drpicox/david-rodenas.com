import { PostsService } from '../posts';
import { TagsService } from '../tags';

/* @ngInject */
export function HomeRouteConfig($routeProvider) {
	$routeProvider.when('/', {
		template: '<app-home posts="$resolve.posts" tags="$resolve.tags"></app-home>',
    resolve: {
      posts: /* @ngInject */ (postsService: PostsService) => postsService.getAll(),
      tags: /* @ngInject */ (tagsService: TagsService) => tagsService.getAll()
    },
    title: 'David Rodenas - {{original}}', 
	});
}

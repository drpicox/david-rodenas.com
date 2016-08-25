import { PostsService } from '../services/posts.service';

/* @ngInject */
export function HomeRouteConfig($routeProvider) {
	$routeProvider.when('/', {
		template: '<app-home posts="$resolve.posts"></app-home>',
    resolve: {
      posts: /* @ngInject */ (postsService: PostsService) => postsService.getAll()
    },
    title: 'David Rodenas - {{original}}', 
	});
}

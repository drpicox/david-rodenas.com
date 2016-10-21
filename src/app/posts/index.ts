import { PostPrevNextComponent } from './components/post-prevnext.component';
import { PostTocComponent } from './components/post-toc.component';
import { PostComponent } from './components/post.component';
import { PostsListComponent } from './components/posts-list.component';
import { PostsRelatedsComponent } from './components/posts-relateds.component';
import { PostsXRouteConfig } from './routes/posts-x-route.config';
import { PostsService } from './services/posts.service';
import { PostsBodiesService } from './services/posts-bodies.service';
import { RelatedPostsService } from './services/related-posts.service';
export { Post } from './services/post';
export { PostsService, PostsBodiesService, RelatedPostsService };

export const PostsModule = angular
	.module('PostsModule', [])
	.config(PostsXRouteConfig)
  .service('postsService', PostsService)
  .service('postsBodiesService', PostsBodiesService)
  .service('relatedPostsService', RelatedPostsService)
	.component('appPostPrevnext', PostPrevNextComponent)
	.component('appPostToc', PostTocComponent)
	.component('appPost', PostComponent)
	.component('appPostsList', PostsListComponent)
	.component('appPostsRelateds', PostsRelatedsComponent)
	.name;

import { HomeComponent } from './components/home.component';
import { PostPrevNextComponent } from './components/post-prevnext.component';
import { PostComponent } from './components/post.component';
import { PostsListComponent } from './components/posts-list.component';
import { PostsRelatedsComponent } from './components/posts-relateds.component';
import { HomeRouteConfig } from './routes/home-route.config';
import { PostsXRouteConfig } from './routes/posts-x-route.config';
import { PostsService } from './services/posts.service';
import { PostsBodiesService } from './services/posts-bodies.service';
import { RelatedPostsService } from './services/related-posts.service';

export const PostsModule = angular
	.module('PostsModule', [])
  .config(HomeRouteConfig)
	.config(PostsXRouteConfig)
  .service('postsService', PostsService)
  .service('postsBodiesService', PostsBodiesService)
  .service('relatedPostsService', RelatedPostsService)
  .component('appHome', HomeComponent)
	.component('appPostPrevnext', PostPrevNextComponent)
	.component('appPost', PostComponent)
	.component('appPostsList', PostsListComponent)
	.component('appPostsRelateds', PostsRelatedsComponent)
	.name;

/*
	postsService
		-get(basename): *Post (with body when resolved)
		-list(): *[Post] (probably without body most of them, when resolved)
*/
;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.factory('postsService', postsServiceFactory);

	postsServiceFactory.$inject = ['markdownTool','$http'];
	function postsServiceFactory  ( markdownTool , $http ) {
		var service = {
			get: get,		// (basename)
			list: list,		// ()
		};

		var data, posts, postList;
		activate();

		function activate() {
			data = $http.get('posts.json').then(function(result) { return result.data; });
			postList = data.then(function(map) {
				return Object.keys(map).map(function(basename) {
					return map[basename];
				}).sort(function(a,b) {
					if (a.date < b.date) {
						return 1;
					} else if (a.date > b.date) {
						return -1;
					} else {
						return 0;
					}
				});
			});
			// compile previews
			postList.then(function(posts) {
				posts.forEach(function(post) {
					post.preview = markdownTool.text(post.preview);
				});
			});
			posts = {};
		}

		function get(basename) {
			var post;

			basename = basename.basename || basename;
			post = posts[basename];
			if (!post) {
				post = data.then(function(map) {
					return {post: map[basename]};
				}).then(function(ctx) {
					return $http.get('dh.posts/'+basename+'.ymd').then(function(result) {
						ctx.body = result.data;
						return ctx;
					});
				}).then(function(ctx) {
					if (!ctx.post.append) {
						return ctx;
					}
					return $http.get(ctx.post.append).then(function(result) {
						ctx.body += result.data;
						return ctx;
					});
				}).then(function(ctx) {
					ctx.post.body = markdownTool.html(ctx.body);
					return ctx.post;
				});

				posts[basename] = post;
			}

			return post;
		}

		function list() {
			return postList;
		}

		return service;
	}

})(angular);
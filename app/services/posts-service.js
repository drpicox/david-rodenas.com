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
					return map[basename];
				}).then(function(post) {
					return $http.get('posts/'+basename+'._md').then(function(result) {
						post.body = markdownTool.html(result.data);
						return post;
					});
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
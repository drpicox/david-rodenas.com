/*
	tagsService
		-get(tagname): *Tag
		-list(): *[Tag]

	Tag: tagname:, posts:[Post], weight
*/
;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.factory('tagsService', tagsServiceFactory);

	tagsServiceFactory.$inject = ['postsService'];
	function tagsServiceFactory  ( postsService ) {
		var service = {
			get: get,		// (tagname)
			list: list,		// ()
		};

		var tagMap, tagList;
		activate();

		function activate() {
			tagMap = postsService.list().then(function(posts) {
				var tagMap = {};

				posts.forEach(function(post) {
					post.tags.forEach(function(tagname) {
						var tag = tagMap[tagname];
						if (!tag) {
							tag = tagMap[tagname] = {tagname:tagname,posts:[],weight:1};
						}
						tag.posts.push(post);
					});				
				});

				return tagMap;
			});

			tagList = tagMap.then(function(tagMap) {
				var tagList = [], sum;

				angular.forEach(tagMap, function(tag) {
					tagList.push(tag);
				});

				// sort by tagname
				tagList.sort(function(a,b) {
					if (a.tagname < b.tagname) {
						return -1;
					} else if (a.tagname > b.tagname) {
						return 1;
					} else {
						return 0;
					}
				});

				// compute weights
				sum = tagList.reduce(function(sum, tag) {
					return sum + tag.posts.length;
				}, 0);
				tagList.forEach(function(tag) {
					tag.weight = tag.posts.length / (sum/tagList.length);
				});

				return tagList;
			});
		}

		function get(tagname) {
			return tagMap.then(function(tagMap) {
				return tagMap[tagname];
			});
		}

		function list() {
			return tagList;
		}

		return service;
	}

})(angular);
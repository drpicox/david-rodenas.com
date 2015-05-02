/*
	imagesService
		-preload(imageUrl): *imageUrl
*/
;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.factory('imagesService', imagesServiceFactory);

	imagesServiceFactory.$inject = ['$q'];
	function imagesServiceFactory  ( $q ) {
		var service = {
			preload: preload,// (imageUrl)
		};

		function preload(imageUrl) {
			return $q(function (resolve) {
				var image = new Image();
				image.onload = finished;
				image.onerror = finished;
				image.src = imageUrl;

				function finished() {
					resolve(imageUrl);
				}
			});
		}

		return service;
	}

})(angular);
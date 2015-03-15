;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.config(locationConfig);

	locationConfig.$inject = ['$locationProvider'];
	function locationConfig  ( $locationProvider ) {
		$locationProvider.hashPrefix('!');
	}

})(angular);
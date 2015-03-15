;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.config(LocationConfig);

	LocationConfig.$inject = ['$locationProvider'];
	function LocationConfig  ( $locationProvider ) {
		$locationProvider.hashPrefix('!');
	}

})(angular);
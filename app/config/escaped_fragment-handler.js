;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.run(escapedFragmentHandler);

	escapedFragmentHandler.$inject = ['$location'];
	function escapedFragmentHandler  ( $location ) {
		var escapedFragment = getQueryParam('_escaped_fragment_');
		if (escapedFragment) {
			$location.path(escapedFragment);
		}
	}

	// Read query params function
	function getQueryParam(variable) {
		var query = window.location.search.substring(1);
		var vars = query.split('&');
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (decodeURIComponent(pair[0]) === variable) {
				return decodeURIComponent(pair[1]);
			}
		}
	}

})(angular);
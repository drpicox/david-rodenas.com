(function(angular) {
	'use strict';

	angular
		.module('com.david-rodenas.dh.pages.root')
		.directive('dhRootView', dhRootView);

	function dhRootView() {
		var directive = {
			restrict: 'E',
			templateUrl: 'dh.pages.root/directives/dhRootView.html',
		};

		return directive;
	}

})(angular);
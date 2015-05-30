(function() {
	'use strict';
	
	angular
		.module('drpxBindAngular', [])
		.directive('drpxBindAngular', drpxBindAngular);

	drpxBindAngular.$inject = ['$compile'];
	function drpxBindAngular  ( $compile ) {
		var directive = {
			restrict: 'A',
			link: link,
		};
		return directive;

		function link(scope, element, attrs) {
			scope.$watch(attrs.drpxBindAngular, update);

			function update(newValue) {
				element.html(newValue);
				$compile(element.contents())(scope);
			}
		}
	}

})(angular);
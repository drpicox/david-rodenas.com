/* @ngInject */
export function ClassRouteLoadingDirective() {
  return { link };

  function link(scope: angular.IScope, element: angular.IAugmentedJQuery, attrs) {
    scope.$on('$routeChangeStart', () => {
      element.addClass('drpx-route-loading')
    });
    scope.$on('$routeChangeSuccess', () => {
      element.removeClass('drpx-route-loading')
    });
    scope.$on('$routeChangeError', () => {
      element.removeClass('drpx-route-loading')
    });
  }
}

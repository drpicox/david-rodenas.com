/* @ngInject */
export function RemoveOnRouteSuccessDirective($$rAF) {
  return { scope: true, link };

  function link(scope: angular.IScope, element: angular.IAugmentedJQuery) {
    scope.$on('$routeChangeSuccess', () => {
      $$rAF(() => {
        scope.$destroy();
        element.remove();
      });
    });
  }
}

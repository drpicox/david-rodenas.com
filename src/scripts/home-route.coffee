# Home Route watcher
# ==================
#
# It includes the '/' route,
# redirections for home if it is needed,
# and a watch on the route to hide home contents.

angular.module('PolarisApp').config [
  '$routeProvider'
  ($routeProvider ) ->

    $routeProvider.when '/',
      template: ''
    $routeProvider.when '/home',
      redirectTo: '/'
    $routeProvider.when '',
      redirectTo: '/'
    $routeProvider.otherwise
      redirectTo: '/'
]


angular.module('PolarisApp').run [
  '$rootScope','$location'
  ($rootScope , $location ) ->
    $rootScope.$on '$routeChangeSuccess', () ->
      $rootScope.showHome = $location.path() == '/'

]
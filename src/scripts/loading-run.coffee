## = A tool to look for loading and warn to the user
## =================================================
##
angular.module('PolarisApp').run [
  '$rootScope',
  ($rootScope ) ->

    $rootScope.viewLoading = false
    $rootScope.$on '$routeChangeStart', () ->
      $rootScope.viewLoading = true
    $rootScope.$on '$routeChangeSuccess', () ->
      $rootScope.viewLoading = false
]

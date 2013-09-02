## = A tool to look for loading and warn to the user
## =================================================
##
app.run [
  '$rootScope',
  ($rootScope ) ->

    $rootScope.viewLoading = 0
    $rootScope.$on '$routeChangeStart', () ->
      $rootScope.viewLoading = 1
    $rootScope.$on '$routeChangeSuccess', () ->
      $rootScope.viewLoading = $rootScope.viewLoading - 1
]

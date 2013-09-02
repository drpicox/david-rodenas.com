app.run [
  '$rootScope','$location','$window',
  ($rootScope , $location , $window ) ->
    $rootScope.$on '$routeChangeSuccess', () ->
      $window.ga 'send','pageview', $location.url()
  ]
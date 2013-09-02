# Home Route watcher
# ==================
#
# It includes the '/' route,
# redirections for home if it is needed,
# and a watch on the route to hide home contents.

app.config [
  '$routeProvider'
  ($routeProvider ) ->

    HomeCtrl = [
      '$scope',
      ($scope ) ->
    ]

    $routeProvider.when '/',
      #resolve: promise: ['Entity', (Entity) -> Entity.promise]
      template: '',
      controller: HomeCtrl
    $routeProvider.when '/home',
      redirectTo: '/'
    $routeProvider.when '',
      redirectTo: '/'
    $routeProvider.otherwise
      redirectTo: '/'
]


app.run [
  '$rootScope','$location'
  ($rootScope , $location ) ->
    $rootScope.$on '$routeChangeSuccess', () ->
      $rootScope.isHome = $location.path() == '/'

]
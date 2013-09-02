# Apps Route
# ==========

app.config [
  '$routeProvider'
  ($routeProvider ) ->

    AppsCtrl = [
      '$scope','resources'
      ($scope , resources) ->
        $scope.resources = resources
    ]

    $routeProvider.when "/apps",
      templateUrl: 'views/apps-view.html'
      resolve: resources: ['Resource', (Resource) -> Resource.asyncQuery()]
      controller: AppsCtrl
      
]
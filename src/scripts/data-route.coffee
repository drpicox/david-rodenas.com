# Data Route
# ==========

app.config [
  '$routeProvider'
  ($routeProvider ) ->

    DataCtrl = [
      '$scope','resources'
      ($scope , resources) ->
        $scope.resources = resources
    ]

    $routeProvider.when "/data",
      templateUrl: 'views/data-view.html'
      resolve: resources: ['Resource', (Resource) -> Resource.asyncQuery()]
      controller: DataCtrl
      
]
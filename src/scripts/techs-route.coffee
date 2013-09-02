# Apps Route
# ==========

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    TechsCtrl = [
      '$scope','$routeParams','resources','tags'
      ($scope , $routeParams , resources , tags) ->
        $scope.search = $routeParams.search
        $scope.resources = resources
        $scope.tags = tags
    ]

    $routeProvider.when "/techs",
      templateUrl: 'views/techs-view.html'
      resolve:
        resources: ['Resource', (Resource) -> Resource.asyncQuery()]
        tags:      ['Resource', (Resource) -> Resource.asyncTags() ]
      controller: TechsCtrl
      
]
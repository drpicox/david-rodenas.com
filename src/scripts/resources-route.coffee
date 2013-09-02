# Resource List Route
# ==================
#
# It registers the route `/resources`

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    ResourceListCtrl = [
      '$scope','$routeParams','resources','tagCloud'
      ($scope , $routeParams , resources , tagCloud) ->
        $scope.search = $routeParams.search
        $scope.resources = resources
        $scope.tagCloud = tagCloud
    ]

    $routeProvider.when '/resources',
      templateUrl: 'views/resources-view.html'
      resolve:
        resources: ['Resource',(Resource) -> Resource.asyncQuery()   ]
        tagCloud: ['Resource',(Resource) -> Resource.asyncTagCloud()]
      controller: ResourceListCtrl
  
]

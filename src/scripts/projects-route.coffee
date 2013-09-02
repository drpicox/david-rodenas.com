# Project List Route
# ==================
#
# It registers the route `/projects`

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    ProjectListCtrl = [
      '$scope','$routeParams','projects','tagCloud'
      ($scope , $routeParams , projects , tagCloud) ->
        $scope.search = $routeParams.search
        $scope.projects = projects
        $scope.tagCloud = tagCloud
    ]

    $routeProvider.when '/projects',
      templateUrl: 'views/projects-view.html'
      resolve:
        projects: ['Project',(Project) -> Project.asyncQuery()   ]
        tagCloud: ['Project',(Project) -> Project.asyncTagCloud()]
      controller: ProjectListCtrl
  
]

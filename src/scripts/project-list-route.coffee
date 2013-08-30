# Project List Route
# ==================
#
# It registers the route `/projects`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    ProjectListCtrl = [
      '$scope','$routeParams','projects','tags','tagCloud'
      ($scope , $routeParams , projects , tags , tagCloud) ->
        $scope.search = $routeParams.search
        $scope.projects = projects
        $scope.tags = tags
        $scope.tagCloud = tagCloud
    ]

    $routeProvider.when '/projects',
      templateUrl: 'views/project-list-view.html'
      resolve:
        projects: ['Project',(Project) -> Project.asyncQuery()   ]
        tags:     ['Project',(Project) -> Project.asyncTags()    ]
        tagCloud: ['Project',(Project) -> Project.asyncTagCloud()]
      controller: ProjectListCtrl
  
]

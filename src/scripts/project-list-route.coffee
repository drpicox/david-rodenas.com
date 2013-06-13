# Project List Route
# ==================
#
# It registers the route `/projects`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    ProjectListResolve = ['Project',(Project) -> Project.asyncQuery()]
    ProjectTagsResolve = ['Project',(Project) -> Project.asyncTags() ]
    ProjectListCtrl = [
      '$scope','$routeParams','projects','tags'
      ($scope , $routeParams , projects , tags ) ->
        $scope.search = $routeParams.search
        $scope.projects = projects
        $scope.tags = tags
    ]

    $routeProvider.when '/projects',
      templateUrl: 'views/project-list-view.html'
      resolve:
        projects: ProjectListResolve
        tags: ProjectTagsResolve
      controller: ProjectListCtrl
  
]

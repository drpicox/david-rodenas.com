# About Search Route
# ====================
#
# It registers the route `/abouts`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

  
#    ProjectsResolver = ['Project',(Project) -> Project.asyncQuery() ]
    AboutViewCtrl = [
      '$scope','projects'
      ($scope , projects ) ->
        $scope.projects = projects
    ]

    $routeProvider.when "/about",
      templateUrl: 'views/about-view.html'
      resolve:
        projects: () -> true # ProjectsResolver
      controller: AboutViewCtrl

]

# Project Search Route
# ====================
#
# It registers the route `/projects`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    ProjectResolver = [
      '$route','Project'
      ($route , Project ) ->
        basename = $route.current.params.project
        Project.asyncGet basename
    ]
    ProjectContentResolver = [
      '$route','Project'
      ($route , Project ) ->
        basename = $route.current.params.project
        Project.asyncContent basename
    ]
    ProjectTagsResolver = ['Project',(Project) ->
      Project.asyncTags()
    ]
    ProjectRelatedResolver = [
      '$route','Project'
      ($route , Project ) ->
        basename = $route.current.params.project
        Project.asyncRelated(basename)
    ]
    ProjectsResolver = ['Project',(Project) -> Project.asyncQuery()]
    ProjectViewCtrl = [
      '$scope','project','content','tags','related','projects'
      ($scope , project , content , tags , related , projects ) ->
        $scope.project = project
        $scope.content = content
        $scope.tags = tags
        $scope.related = related.slice(0,3)
        $scope.projects = projects
    ]

    $routeProvider.when '/projects/:project',
      templateUrl: 'views/project-view.html'
      resolve:
        project: ProjectResolver
        content: ProjectContentResolver
        tags: ProjectTagsResolver
        related: ProjectRelatedResolver
        projects: ProjectsResolver
      controller: ProjectViewCtrl
  
]

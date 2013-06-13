# Area Search Route
# ====================
#
# It registers the route `/areas`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    AreaResolver = (basename) -> [ 'Area',(Area) ->
      Area.asyncGet basename
    ]
    AreaContentResolver = (basename) -> [ 'Area',(Area) ->
      Area.asyncContent basename
    ]
    AreaTagsResolver = ['Area',(Area) ->
      Area.asyncTags()
    ]
    ProjectsResolver = ['Project',(Project) ->
      Project.asyncQuery()
    ]
    AreaViewCtrl = [
      '$scope','area','content','tags','projects'
      ($scope , area , content , tags , projects ) ->
        $scope.area = area
        $scope.content = content
        $scope.tags = tags
        ps = (p for p in projects when p._tagSet[area.basename]?)
        $scope.projects = ps.slice(0,3)
    ]

    route = (basename) ->
      $routeProvider.when "/#{basename}",
        templateUrl: 'views/area-view.html'
        resolve:
          area: AreaResolver basename
          content: AreaContentResolver basename
          tags: AreaTagsResolver
          projects: ProjectsResolver
        controller: AreaViewCtrl

    route b for b in ['apps','data','real-time']
  
]

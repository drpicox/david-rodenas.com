# Resource Search Route
# ====================
#
# It registers the route `/resources/:resource`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->
    ResourceResolver = [
      '$route','Resource'
      ($route , Resource ) ->
        basename = $route.current.params.resource
        Resource.asyncGet basename
    ]
    ResourceContentResolver = [
      '$route','Resource'
      ($route , Resource ) ->
        basename = $route.current.params.resource
        Resource.asyncContent basename
    ]
    ResourcesResolver = [
      'Resource'
      (Resource ) ->
        Resource.asyncQuery()
    ]
    ResourceViewCtrl = [
      '$scope','Resource','resource','content','resources'
      ($scope , Resource , resource , content , resources ) ->
        $scope.resource = resource
        $scope.content = content
        $scope.resources = resources
        $scope.advanced = (doc) ->
          Resource.filterSearch doc, $scope.search
    ]
    $routeProvider.when '/resources/:resource',
       templateUrl: 'views/resource-view.html'
       resolve:
         resource: ResourceResolver
         content: ResourceContentResolver
         resources: ResourcesResolver
       controller: ResourceViewCtrl
]


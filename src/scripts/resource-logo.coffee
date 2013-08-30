# Resource Brief directive
# =======================

angular.module('PolarisApp').directive 'resourceLogo',
['Resource',(Resource) -> {

  restrict: 'E'
  template: """
<a href='#/resources/{{resource.basename}}' ng-show='resource.logo'
  ><img ng-src='{{resource.logo}}' style='height:1em'
    alt='{{resource.title}}'
    ></a>
            """
  scope: basename: '@', shape: '@'
  link: (scope, element, attrs) ->
    scope.$watch "shape", (shape) -> scope.shape = shape or "circle"
    scope.$watch "basename", (basename) ->
      Resource.asyncGet(basename).then (resource) ->
        scope.resource = resource
}]
  
#<span class='img-{{shape}}'
#     style='height:1em;width:1em;display:inline-block;
#            background-image:url({{resource.logo}});
#            background-size:cover;
#            background-position:center;
#            '>
#</span>

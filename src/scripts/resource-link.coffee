# Resource Brief directive
# =======================

angular.module('PolarisApp').directive 'resourceLink',
['Resource',(Resource) -> {

  restrict: 'E'
  template: """
<a class='label label-warning'
   href='#/resources/{{resource.basename}}'
   bs-tooltip='tooltip'>{{resource.title}}</a>
            """
  scope: basename: '@'
  link: (scope, element, attrs) ->
    scope.$watch "basename", (basename) ->
      Resource.asyncGet(basename).then (resource) ->
        scope.tooltip = (resource.abstract or "").split(".")[0] + "."
        scope.resource = resource
}]
  

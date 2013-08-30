# Document Search directive
# ========================

angular.module('PolarisApp').directive 'documentList', [
  'StaticResource', (StaticResource) -> {

    restrict: 'E'
    scope: documents: '=', search: '@', tags: '=', collection: '@'
    templateUrl: 'views/document-list.html'
    link: (scope,element,attrs) ->
      scope.show = (doc, force) ->
        if doc.basename == scope.visible and not force
          delete scope.visible
          return
        if doc._content
          scope.visible = doc.basename
        else
          doc._asyncContent().then (content) ->
            doc._content = content
            scope.visible = doc.basename

      scope.$watch "filtered", ( (v) ->
        if v and v.length == 1
          scope.show v[0], true
      ), true
      
#scope.advanced = (doc) -> StaticResource.filterSearch doc, scope.search
        
  }
]
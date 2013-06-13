# Document Search directive
# ========================

angular.module('PolarisApp').directive 'documentList', [
  'StaticResource', (StaticResource) -> {

    restrict: 'E'
    scope: documents: '=', search: '@'
    template: """
<form class='form-search'>
  <div class='input-append'>
    <input type='text' placeholder='search...'
        class='input-large search-query'
        ng-model='search'>
    <button class='btn disabled'><i class='icon-search'></i></button>
  </div>
</form>
<ul class='unstyled'>
  <li ng-repeat='doc in filtered = (documents | filter:advanced)'>
    <a href='#/{{collection}}/{{doc.basename}}'>{{doc.title}}</a>
  </li>
</ul>
<div class='alert alert-info'
  ng-show='!filtered || filtered.length == 0'>
  <strong>No {{collection}} found.</strong>
  No {{collection}} have been found with your current criteria.
</div>
    """
    link: (scope,element,attrs) ->
      scope.collection = attrs.collection
      scope.search = attrs.search
      scope.advanced = (doc) ->
        query = scope.search
        return true if not query
        q = query.toLowerCase().match(/[^\s]+/g) or []
        for k in q
          return false if not doc._search[k]
        true
        
  }
]
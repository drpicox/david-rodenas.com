# People List directive
# ========================

angular.module('PolarisApp').directive 'peopleSearch', [
  'Person', (Person) -> {

    restrict: 'E'
    scope: people: '=', search: '@'
    template: """
<form class='form-search'>
  <div class='input-append'>
    <input type='text' placeholder='search in people...'
        class='input-large search-query'
        ng-model='search'>
    <button class='btn disabled'><i class='icon-search'></i></button>
  </div>
<ul class='inline' style='margin-top: 5px;'>
  <li ng-repeat='tag in tags'><a
    href='#/people?search=tag:{{tag}}'
    class='label label-success'
      >{{tag}}</a></li>
</ul>
</form>
<br>
<div class='blocks2'>
<div
  ng-repeat='person in filtered = (people | filter:advanced)'
  class='block' style='margin-bottom:20px;'
  ><person-brief
    person='person'
    ></person-brief
  ></div>
</div>
<div class='alert alert-info'
  ng-show='!filtered || filtered.length == 0'>
  <strong>No people found.</strong>
  No people have been found with your current criteria.
</div>
    """
    link: (scope,element,attrs) ->
      scope.tags = ["friend","school","colleague","guru"]
      scope.search = attrs.search
      scope.advanced = (doc) ->
        Person.filterSearch doc, scope.search
        
  }
]
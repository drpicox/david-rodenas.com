# Project Search directive
# ========================

angular.module('PolarisApp').directive 'projectSearch', [
  'Project', (Project) -> {

    restrict: 'E'
    scope: projects: '=', search: '@'
    template: """
<form class='form-search'>
  <div class='input-append'>
    <input type='text' placeholder='search in projects...'
        class='input-large search-query'
        ng-model='search'>
    <button class='btn disabled'><i class='icon-search'></i></button>
  </div>
</form>
<project-brief
  ng-repeat='project in filtered = (projects | filter:advanced)'
  project='project'
  ></project-brief>
<div class='alert alert-info'
  ng-show='!filtered || filtered.length == 0'>
  <strong>No projects found.</strong>
  No projects have been found with your current criteria.
</div>
    """
    link: (scope,element,attrs) ->
      scope.search = attrs.search
      scope.advanced = (doc) ->
        Project.filterSearch doc, scope.search
        
  }
]
# Project Search directive
# ========================

app.directive 'resourceListIcon', [
  'Resource', (Resource) -> {

    restrict: 'E'
    scope: resources: '=', search: '@'
    template: """
<div class='row-fluid'><div class='span12'>
<a ng-repeat='resource in filtered = (resources | filter:advanced)'
   ng-href='#/techs?search=id:{{resource.basename}}'
   class='img-contain'
   style='width:24px; height:24px; display: inline-block;
          margin:0 5px 5px 0;'
   ng-style="{'background-image':
   'url(images/resources/'+resource.basename+'.png)'}"
    >
<a ng-href='#/techs?search={{search}}'
   style='height: 24px; line-height: 24px; font-size: 20px;
          vertical-align: top;
          display: inline-block; margin-bottom: 10px'>
    <i class='icon-chevron-sign-right'></i>
</a>
</div></div>
    """
    link: (scope,element,attrs) ->
      scope.search = attrs.search
      scope.advanced = (doc) ->
        Resource.filterSearch doc, scope.search
        
  }
]
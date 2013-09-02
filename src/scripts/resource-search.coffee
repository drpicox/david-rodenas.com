# Project Search directive
# ========================

app.directive 'resourceSearch', [
  'Resource', (Resource) -> {

    restrict: 'E'
    scope: resources: '=', search: '@', tags: '='
    template: """
<div class='row-fluid'><div class='offset2 span10 phone-offset1 phone-span3'>
<form class='form-search'>
  <div class='input-append'>
    <input type='text' placeholder='cerca tecnologies...'
        class='input-large search-query'
        ng-model='search'>
    <button class='btn disabled'><i class='icon-search'></i></button>
  </div>
  <div style='margin-top: 5px; font-size:11px;'>
    <document-tag-cloud tags='tags' collection='techs'>
    </document-tag-cloud>
  </div>
</form>
</div></div>

<div ng-repeat='resource in filtered = (resources | filter:advanced)'
 no-ng-repeat='resource in filtered'>
  <div class='row-fluid' style='margin-bottom: 8px'>
    <div class='span2 phone-span1' ng-click='show(resource)'>
    <div class='block tile x2 img-contain'
    style='cursor: pointer; '
    ng-style="{'background-image':
    'url(images/resources/'+resource.basename+'.png)'}"
    ></div></div>

    <div class='span10 phone-span3'>
    <h4>{{resource.name}}</h4>
    <p ng-click='show(resource)' style='cursor: pointer'>
    {{resource.preview}}
    <i class='icon-chevron-sign-down'
       ng-show='visible != resource.basename'></i>
    <i class='icon-chevron-sign-up'
       ng-show='visible == resource.basename'></i>
    </p>
    <markdown text='resource._content'
      ng-show='visible == resource.basename'
      class='hidden-phone collapse'></markdown>
    </div>
  </div>
  
  <div class='row-fluid visible-phone'>
    <div class='collapse'
    ng-class='{in: visible == resource.basename}'>
      <markdown text='resource._content'></markdown>
      <p ng-click='show(resource)'
           style='cursor: pointer; border-top: solid 1px #eee;'>
        <i class='icon-chevron-sign-up'></i>
      </p>
    </div>
  </div>
</div>

<div class='row-fluid'><div class='offset2 span10 phone-offset1 phone-span3'>
<div class='alert alert-info'
  ng-show='!filtered || filtered.length == 0'>
  <strong>No s'han trobat tecnologies.</strong>
  No s'ha trobat cap tecnologia que satisfaci el criteri actual.
</div>
</div></div>
    """
    link: (scope,element,attrs) ->
      scope.show = (doc, force) ->
        if doc.basename == scope.visible and not force
          delete scope.visible
          return
        if doc._content
          scope.visible = doc.basename
        else
          Resource.asyncContent(doc.basename).then (content) ->
            doc._content = content
            scope.visible = doc.basename

      scope.$watch "filtered", ( (v) ->
        if v and v.length == 1
          scope.show v[0], true
      ), true
      
      scope.advanced = (doc) ->
        Resource.filterSearch doc, scope.search
        
  }
]
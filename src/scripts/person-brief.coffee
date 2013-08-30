# Person Brief directive
# =======================

angular.module('PolarisApp').directive 'personBrief', () -> {

  restrict: 'E'
  template: """
<div class='row-fluid'>
  <div class='span3 desktop-right'>
    <img ng-src='{{person.photo}}' class='img-circle'
         style='width:100%;max-width:100px;'>
  </div>
  <div class='span9'>
    <h4>{{person.title}}</h4>
    <markdown>{{person.preview}}</markdown>
    <a href='#/people/{{person.basename}}'>See person &rarr;</a>
  </div>
</div>
            """
  scope: person: '='
}
  

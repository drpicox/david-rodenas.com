# Project Search directive
# ========================

angular.module('PolarisApp').directive 'documentTagCloud', () -> {
  restrict: 'E'
  scope: tags: '=', collection: '@'
  template: """
<span ng-repeat='(tag,m) in tags'>
  <a  href='#/{{collection}}?search=tag:{{tag}}'
    ><span class='label label-info' style='margin-bottom: 0.2em'
       ><span style='display: inline-block; line-height: 1.1;
                     font-size: {{10+m*15}}px;'>{{tag}}</span
       ></span
    ></a>
</span>
  """
    
}

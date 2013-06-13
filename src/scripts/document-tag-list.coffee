# Document Tag List directive
# ===========================

angular.module('PolarisApp').directive 'documentTagList', () -> {

  restrict: 'E'
  scope: document:'=', collection:'@'
  template: """
<span ng-repeat='tag in document.tags'>
  <a  href='#/{{collection}}?search=tag:{{tag}}'
      ><span class='label label-info'>{{tag}}</span
      ></a>
</span>
            """
}
  

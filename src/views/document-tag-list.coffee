# Document Tag List directive
# ===========================

angular.module('PolarisApp').directive 'documentTagList', () -> {

  restrict: 'E'
  scope: tags:'=', collection:'@'
  template: """
<span ng-repeat='tag in tags'>
  <a  href='#/{{collection}}?search=tag:{{tag}}'
      ><span class='tag tag-item'>{{tag}}</span
      ></a>
</span>
            """
}
  

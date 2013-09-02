# Document Tag List directive
# ===========================

app.directive 'tagList', () -> {

  restrict: 'E'
  scope: tags:'=', collection:'@'
  template: """
<span ng-repeat='tag in tags'>
  <a  href='#/{{collection}}?search=tag:{{tag}}'
      ><span class='label label-info'>{{tag}}</span
      ></a>
</span>
            """
}
  

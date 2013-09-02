# Project Search directive
# ========================

app.directive 'tagCloud', () -> {
  restrict: 'E'
  scope: tagCloud: '=', collection: '@'
  template: """
<span ng-repeat='(tag,m) in tagCloud'>
  <a  href='#/{{collection}}?search=tag:{{tag}}'
    ><span class='label label-info'
       style='margin-bottom: 0.2em; font-size: 100%'
       ><span style='display: inline-block; line-height: 1.1;
                     font-size: {{70+m*140}}%;'>{{tag}}</span
       ></span
    ></a>
</span>
  """
    
}

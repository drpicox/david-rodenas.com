# Project Brief directive
# =======================

angular.module('PolarisApp').directive 'projectBrief', () -> {

  restrict: 'E'
  template: """
<div class='well well-small well-white well-raised well-item'>
  <div class='pull-left color-secondary-black'
       style='font-size:40px'
      ><i class='icon-{{project.icon}}'></i></div>
  <div style='margin-left: 47px'>
    <h4 style='margin: 0 0 0.4em'>{{project.title}}</h4>
    <markdown>{{project.preview}}</markdown>
    <document-tag-list document='project' collection='projects'>
    </document-tag-list>
    <br>
    <a href='#/projects/{{project.basename}}'>See project &rarr;</a>
  </div>
</div>
            """
  scope: project: '='
}
  

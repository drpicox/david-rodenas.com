# Project Top Ctrl
# ================
#
# A controller that provides convinence methods
# to get a list of the top 5 projects.
app.controller('ProjectTopCtrl', [
  'Project', '$scope',
  (Project ,  $scope ) ->

    $scope.loading = true
    $scope.projects = Project.asyncQuery().then (data) ->
      $scope.loading = false
      data.slice 0, 5
    
  ]
)
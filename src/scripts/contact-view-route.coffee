# Contact Search Route
# ====================
#
# It registers the route `/contacts`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

  
#    ProjectsResolver = ['Project',(Project) -> Project.asyncQuery() ]
    ContactViewCtrl = [
      '$scope','$timeout','$rootElement','projects'
      ($scope , $timeout , $rootElement , projects ) ->
        $rootElement.find("input[type='email']").focus()
        $scope.projects = projects
        $scope.$watch 'email', () ->
          if $scope.autoName == $scope.name and $scope.email
            name = $scope.email.split('@')[0]
            name = name.match /[a-zA-Z]+/g
            name = for word in name
              word.charAt(0).toUpperCase() + word.slice(1)
            name = name.join ' '
            $scope.autoName = $scope.name = name
        $scope.send = () ->
          $.post "send.php", r: {
              name: $scope.name
              email: $scope.email
              message: $scope.message
            }, () ->
              $scope.sent = true
              $scope.$apply()
        $scope.clear = () ->
          $scope.message = ""
          $scope.sent = false
    ]

    $routeProvider.when "/contact",
      templateUrl: 'views/contact-view.html'
      resolve:
        projects: () -> true # ProjectsResolver
      controller: ContactViewCtrl

]

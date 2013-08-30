# Contact Search Route
# ====================
#
# It registers the route `/contacts`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

  
#    ProjectsResolver = ['Project',(Project) -> Project.asyncQuery() ]
    ContactViewCtrl = [
      '$scope','$timeout','$rootElement','$routeParams','projects'
      ($scope , $timeout , $rootElement , $routeParams , projects ) ->
        $rootElement.find("input[type='email']").focus()
        $scope.initialSubject = $scope.subject = $routeParams.subject
        console.log $scope.subject
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
              subject: $scope.subject
              initialSubject: $scope.initialSubject
              message: $scope.message
            }, () ->
              $scope.sent = true
              $scope.$apply()
        $scope.clear = () ->
          $scope.message = ""
          $scope.sent = false
          delete $scope.subject
          delete $scope.initialSubject
    ]

    $routeProvider.when "/contact",
      templateUrl: 'views/contact-view.html'
      resolve:
        projects: () -> true # ProjectsResolver
      controller: ContactViewCtrl

]

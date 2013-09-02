# Contact Search Route
# ====================
#
# It registers the route `/contact`

app.config [
  '$routeProvider',
  ($routeProvider ) ->

  
#    ProjectsResolver = ['Project',(Project) -> Project.asyncQuery() ]
    ContactViewCtrl = [
      '$scope','$timeout','$rootElement','projects','$http'
      ($scope , $timeout , $rootElement , projects , $http) ->
        $rootElement[0].querySelector("input[type='email']").focus()
        $scope.projects = projects
        $scope.$watch 'email', () ->
          if $scope.autoName == $scope.name and $scope.email
            name = $scope.email.split('@')[0]
            name = name.match /[a-zA-Z]+/g
            name = for word in name
              word.charAt(0).toUpperCase() + word.slice(1)
            name = name.join ' '
            $scope.autoName = $scope.name = name
        transformRequest = (obj) ->
          str = []
          for p in obj
            str.push(encodeURIComponent(p) + "="
              + encodeURIComponent(obj[p]))
            str.join "&"
        $scope.send = () ->
          $http(
            method: 'POST'
            url: "send.php"
            data:
              name: $scope.name
              email: $scope.email
              message: $scope.message
            #headers:
            #  'Content-Type': 'application/x-www-form-urlencoded'
            #transformRequest: transformRequest
            ).success () ->
              $scope.sent = true
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

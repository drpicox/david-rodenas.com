# People List Route
# ====================
#
# It registers the route `/people`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    PeopleResolver = ['Person',(Person) ->
      Person.asyncQuery()
    ]
    PeopleViewCtrl = [
      '$scope','$routeParams','people'
      ($scope , $routeParams , people ) ->
        $scope.search = $routeParams.search
        $scope.people = people
    ]

    $routeProvider.when '/people',
      templateUrl: 'views/people-list-view.html'
      resolve:
        people: PeopleResolver
      controller: PeopleViewCtrl
  
]

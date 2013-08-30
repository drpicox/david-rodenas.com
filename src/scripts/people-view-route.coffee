# Person Search Route
# ====================
#
# It registers the route `/persons`

angular.module('PolarisApp').config [
  '$routeProvider',
  ($routeProvider ) ->

    PersonResolver = [
      '$route','Person'
      ($route , Person ) ->
        basename = $route.current.params.person
        Person.asyncGet basename
    ]
    PersonContentResolver = [
      '$route','Person'
      ($route , Person ) ->
        basename = $route.current.params.person
        Person.asyncContent basename
    ]
    PeopleResolver = ['Person',(Person) ->
      Person.asyncQuery()
    ]
    PersonViewCtrl = [
      '$scope','person','content','people'
      ($scope , person , content , people ) ->
        $scope.person = person
        $scope.content = content
        $scope.people = people
    ]

    $routeProvider.when '/persons/:person',
      templateUrl: 'views/person-view.html'
      resolve:
        person: PersonResolver
        content: PersonContentResolver
        people: PeopleResolver
      controller: PersonViewCtrl
  
]

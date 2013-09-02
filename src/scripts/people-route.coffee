# Person List Route
# ==================
#
# It registers the route `/people`

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    PersonListCtrl = [
      '$scope','$routeParams','people','tagCloud'
      ($scope , $routeParams , people , tagCloud) ->
        $scope.search = $routeParams.search
        $scope.people = people
        $scope.tagCloud = tagCloud
    ]

    $routeProvider.when '/people',
      templateUrl: 'views/people-view.html'
      resolve:
        people: ['Person',(Person) -> Person.asyncQuery()   ]
        tagCloud: ['Person',(Person) -> Person.asyncTagCloud()]
      controller: PersonListCtrl
  
]

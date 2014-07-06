# Courses Route
# ==========

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    CoursesCtrl = [
      '$scope','subjects'
      ($scope , subjects ) ->
        $scope.subjects = subjects
    ]

    $routeProvider.when "/courses",
      templateUrl: 'views/subjects-view.html'
      resolve:
        subjects: [ 'Subject', (Subject) -> Subject.get() ]
      controller: CoursesCtrl
      
]
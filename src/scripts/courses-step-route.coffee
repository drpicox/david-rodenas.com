# Courses Route
# ==========

app.config [
  '$routeProvider',
  ($routeProvider ) ->

    CoursesCtrl = [
      '$scope','subject','course','step','body'
      ($scope , subject , course , step , body ) ->
        $scope.subject = subject
        $scope.course = course
        $scope.step = step
        $scope.body = body

        steps = course.steps
        idx = steps.indexOf step
        $scope.next = steps[idx + 1] if steps.length < idx + 1
        $scope.prev = steps[idx - 1] if 0 < idx
    ]

    SubjectResolver = ['Course','Subject','$route', (Course,Subject,$route) ->
      course = $route.current.params.course

      Course.get(course).then (course) ->
        Subject.get course.from
    ]

    CourseResolver = ['Course','$route', (Course,$route) ->
      course = $route.current.params.course

      Course.get course
    ]

    StepResolver = ['Course','$route', (Course,$route) ->
      course = $route.current.params.course
      step = $route.current.params.step

      Course.get(course).then (course) ->
        course.steps[step]
    ]

    BodyResolver = ['Course','Step','$route', (Course,Step,$route) ->
      course = $route.current.params.course
      step = $route.current.params.step

      Course.get(course).then (course) ->
        step = course.steps[step]
        Step.get_body step.basename

    ]

    $routeProvider.when "/courses/:course/:step",
      templateUrl: 'views/courses-step-view.html'
      resolve:
        subject: SubjectResolver
        course: CourseResolver
        step: StepResolver
        body: BodyResolver
      controller: CoursesCtrl
      
]
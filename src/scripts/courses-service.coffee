app.factory 'CoursesService',
['$http','$q',
( $http,  $q) ->

  data = $http.get('data/courses.json').then (r) -> r.data
  data = data.then (data) ->

    for name,subject of data when subject.kind == 'subject'
      subject.courses = []

    for name,course of data when course.kind == 'course'
      course.steps = []
      course.subject = data[course.from]
      course.subject.courses.push course

    for name,step of data when step.kind == 'step'
      step.course = data[step.from]
      step.idx = step.course.steps.length
      step.course.steps.push step

    data

  CoursesService =
    get: () -> data

    get_body: (arg) ->
      basename = if angular.isString arg then arg else arg.basename
      file = "data/courses/#{basename}.md"
      contentDefer = $q.defer()
      $http.get(file)
      .success (content) ->
        contentDefer.resolve content.slice 5+content.search(/\n---\n/)
      .error (e) ->
        contentDefer.reject e
      contentDefer.promise

  
]

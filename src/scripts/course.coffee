app.factory 'Course',
['CoursesService','Step','$q'
( CoursesService , Step , $q ) ->

  data = CoursesService.get()
  steps = Step.get() # ensure steps are fully loaded

  coursesX = $q.all([data,steps]).then ([data,steps]) ->
    courses = {}
    for name,course of data when course.kind == 'course'
      courses[name] = course

    courses
  
  Course =
    get: (basenames) -> coursesX.then (courses) ->
      if angular.isArray(basenames)
        courses[basename] for basename in basenames
      else if basenames
        courses[basenames]
      else
        courses

]
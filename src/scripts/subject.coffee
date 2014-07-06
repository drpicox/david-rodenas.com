
app.factory 'Subject',
['CoursesService','Course','$q'
( CoursesService , Course , $q ) ->

  data = CoursesService.get()
  courses = Course.get() # ensure courses are fully loaded

  subjectsX = $q.all([data,courses]).then ([data,courses]) ->
    subjects = {}
    for name,subject of data when subject.kind == 'subject'
      subjects[name] = subject

    subjects
  
  Subject =
    get: (basenames) -> subjectsX.then (subjects) ->
      if angular.isArray(basenames)
        subjects[basename] for basename in basenames
      else if basenames
        subjects[basenames]
      else
        subjects

]
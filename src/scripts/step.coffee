app.factory 'Step',
['CoursesService'
( CoursesService ) ->

  stepsX = CoursesService.get().then (data) ->
    steps = {}
    for basename,step of data when step.kind == 'step'
      steps[basename] = step
    steps
  
  Step =
    get: (basenames) -> stepsX.then (steps) ->
      if angular.isArray(basenames)
        steps[basename] for basename in basenames
      else if basenames
        steps[basenames]
      else
        steps
    get_body: (basename) ->
      CoursesService.get_body basename
]
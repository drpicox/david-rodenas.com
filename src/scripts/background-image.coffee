app.directive 'backgroundImage', [
  () -> {
    restrict: 'A'
    #scope: backgroundImage: '@'
    link: (scope,element,attrs) ->
      attrs.$observe 'backgroundImage', (url) ->
        element.css 'background-image': 'url('+url+')'
          
  }
]
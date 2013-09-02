app.directive 'toggle', [
  '$window','$location',
  ($window , $location ) -> {
    restrict: 'A'
    link: (scope,element,attrs) ->
      name = attrs.toggle.split('=')[0]
      init = attrs.toggle.split('=')[1]
      scope[name] = init
      scope.toggle = (toggle) ->
        toggle ?= name
        scope[toggle] = not scope[toggle]
        if $window._gaq
          $window._gaq.push ['_trackPageview',
            $location.url()+"?"+toggle+"="+scope[toggle]]
          
  }
]
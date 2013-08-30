angular.module('PolarisApp').run [
  '$rootScope','$window','$location','$anchorScroll'
  ($rootScope , $window , $location , $anchorScroll ) ->

    $rootScope.scrollTo = (id,event) ->
      $location.hash id
      $anchorScroll()
      $window.ga 'send','pageview', $location.url()
    #  false && setTimeout(
    #    (() ->
    #      $window.scrollTo 0, $("#"+id).offset().top - 40
    #    ), 10
    #  )
      event.preventDefault() if event
]

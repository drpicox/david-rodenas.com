# = Area StaticResource
angular.module('PolarisApp').factory 'Area',
['StaticResource',
( StaticResource ) ->
        
    Area = StaticResource name: 'areas'
]

# = Resource StaticResource
angular.module('PolarisApp').factory 'Resource',
['StaticResource',
( StaticResource ) ->
        
    Resource = StaticResource name: 'resources'
]

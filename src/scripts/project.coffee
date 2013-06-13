# = Project StaticResource
angular.module('PolarisApp').factory 'Project',
['StaticResource',
( StaticResource ) ->
        
    Project = StaticResource name: 'projects'
]

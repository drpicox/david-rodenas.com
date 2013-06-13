# = Person StaticPerson
angular.module('PolarisApp').factory 'Person',
['StaticResource',
( StaticResource ) ->
        
    Person = StaticResource name: 'people'
]

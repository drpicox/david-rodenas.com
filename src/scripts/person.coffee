# = Person StaticResource
app.factory 'Person',
['StaticResource',
( StaticResource ) ->
        
    Person = StaticResource name: 'people'
]

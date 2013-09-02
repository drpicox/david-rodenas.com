# = Resource StaticResource
app.factory 'Resource',
['StaticResource',
( StaticResource ) ->
        
    Resource = StaticResource name: 'resources'
]

# = Project StaticResource
app.factory 'Project',
['StaticResource',
( StaticResource ) ->
        
    Project = StaticResource name: 'projects'
]

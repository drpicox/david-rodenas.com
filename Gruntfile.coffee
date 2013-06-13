# = Gruntfile for the compilation of the project
#
# It is based in two compilation folders:
#   debug/
#   dist/
# and one source folder:
#   src/
#
# 'debug/' is a site with all the information required
# to perform a debug. 'dist/' is a folder that contains
# a standalone version optimised, it is the version to
# install in a webserver.
#
# The compilation process starts always generating the
# 'debug/', and once it is generated, an optimisation
# is done to create the 'dist/' folder.
#
# Available grunt tasks are:
#
#    debug: builds the 'debug/' folder
#    dist: builds the 'debug/' and 'dist/' folder
#    clean: removes the 'debug/' and 'dist/' folders
#    server: build the 'debug/' folder, creates a 'livereload'
#            task and watch over the 'src/', and starts a web
#            server on 'debug/'
#    server:dist: builds the 'dist/' folder and creates a web 
#           server on 'dist/'

module.exports = (grunt) ->
  # Load grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  # Livereload helpers
  path = require 'path'
  lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

  # Twitter bootstrap JS files
  bootstrapJSFiles = ('src/components/bootstrap/js/'+f for f in [
        'bootstrap-transition.js'
        'bootstrap-modal.js'
        'bootstrap-dropdown.js'
        'bootstrap-scrollspy.js'
        'bootstrap-tab.js'
        'bootstrap-tooltip.js'
        'bootstrap-popover.js'
        'bootstrap-affix.js'
        'bootstrap-alert.js'
        'bootstrap-button.js'
        'bootstrap-collapse.js'
        'bootstrap-carousel.js'
        'bootstrap-typeahead.js'
        ])
    

  # Project configuration
  grunt.initConfig 
    
    pkg: grunt.file.readJSON 'package.json'

    # = Specific task configurations for 'debug/'
    # Compile less files
    #   all less files are compiled into 'debug/'
    #   resulting css are compressed later to 'build/'
    less: 
      debug:
        files: "debug/styles.css": "src/styles/styles.less"
        options:
          paths: ["src/style"]
          compress:        false 
          yuicompress:     false # '<%= app.compress %>'
          dumpLineNumbers: "all" # false
          optimization:    0     # 3

    # Concatenate and generate javascript from coffeescript tasks
    coffee:
      debug:
        options:
          join: true
          sourceMap: true #'<%= !app.compress %>'
        files:
          'debug/app.js': ['src/scripts/app.coffee','src/scripts/**/*.coffee']

    concat:
      'debug-components':
        files:
          'debug/third-party.js': [].concat([
            'src/components/jquery/jquery.js'
            ]).concat(bootstrapJSFiles).concat([
            'src/components/google-code-prettify/src/prettify.js'
            'src/components/google-code-prettify/src/lang*.js'
            'src/components/showdown/src/showdown.js'
            'src/components/showdown/src/extensions/prettify.js'
            'src/components/angular/angular.js'
            'src/components/angular-resource/angular-resource.js'
            'src/components/angular-cookies/angular-cookies.js'
            'src/components/angular-sanitize/angular-sanitize.js'
            'src/components/angular-strap/dist/angular-strap.js'
            'src/scripts/extra/*.js'
            ]);
          'debug/third-party.css':
            'src/components/google-code-prettify/styles/desert.css'

    # = Specific task configurations for 'dist/'
    # html: Compile the html files
    htmlmin:
      dist:
        options:
          removeComments:            true
          collapseWhitespace:        true && false # some problems detected
          removeOptionalTags:        true
          removeRedundantAttributes: true && false # <input type="text"
          removeAttributeQuotes:     true
        files: [
          expand: true
          cwd: 'src/'
          src: ['*.html', 'views/*.html']
          dest: 'dist'
        ]

    # html: Use globals CDN if possible
    cdnify:
      dist:
        html: 'dist/index.html'
        
    # css: Minimise css
    cssmin:
      'dist-lesscss':
        files:
          'dist/styles.css': 'debug/styles.css'
      'dist-components':
        files:
          'dist/third-party.css': 'debug/third-party.css'

    # = Tasks configurations required for both 'debug/' and 'dist/'
    # images: Copy and optimize images
    imagemin:
      debug:
        options: optimizationLevel: 0
        files: [
          expand: true
          cwd: 'src/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: 'debug/images'
        ]
      dist:
        options: optimizationLevel: 3
        files: [
          expand: true
          cwd: 'src/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: 'dist/images'
        ]

    # Copy components to the debug
    copy:
      'debug-html': files: [
          # copy views
          expand:true
          cwd: 'src/'
          src: ['*.html', 'views/*.html']
          dest: 'debug'
        ]
      'debug-data': files: [
          # copy data
          expand:true
          cwd: 'src/'
          src: ['data/**/*.md']
          dest: 'debug'
        ]  
      'dist-data': files: [
          # copy components
          expand:true
          cwd: 'debug/'
          src: ['data/*.json','data/**/*.md']
          dest: 'dist'
        ]
      'debug-sendphp': files: 'debug/send.php': 'src/debug-send.php'  
      'dist-sendphp': files: 'dist/send.php': 'src/send.php'  

    # js: Coffeelint
    coffeelint:
      options:
        # no_implicit_braces: true
        # no_implicit_parens:
        # no_empty_param_list:
        no_plusplus: true
        #        'no_trailing_whitespace: allowed_in_comments: true
      files: [ 'src/scripts/*.coffee', 'src/scripts/**/*.coffee' ]        

    # js: Uglify
    uglify:
      'dist-coffee':
        options: preserveComments: 'some', report: 'min'
        files: 'dist/app.js': 'debug/app.js'
#      'debug-bootstrap':
#        options:
#          compress: false
#          preserveComments: 'all'
#          sourceMap: 'debug/components/bootstrap/js/bootstrap.map.js'
#          sourceMappingURL: 'components/bootstrap/js/bootstrap.map.js'
#        files:
#          'debug/components/bootstrap/js/bootstrap.js': 'src/components/bootstrap/js/*.js'
      'dist-components':
        options:
          preserveComments: 'some' # 'none'
          report: 'min'
        files:
          'dist/third-party.js': 'debug/third-party.js'

    # data: markdown 2 json
    m2j:
      debug:
        options: width: 100
        files:
          'debug/data/projects.json': ['src/data/projects/*.md']
          'debug/data/areas.json': ['src/data/areas/*.md']
          'debug/data/people.json': ['src/data/people/*.md']
          'debug/data/resources.json': ['src/data/resources/*.md']
        
        
    # Livereload web server
    livereload:
      port: 35729
    connect:
      'livereload':
        options: 
          hostname: '0.0.0.0'
          port: 9001
          middleware: (connect,options) ->
            options.base = path.resolve 'debug'
            [lrSnippet, connect.static(options.base), connect.directory(options.base)]
      'livereload-dist':
        options: 
          port: 9001
          middleware: (connect,options) ->
            options.base = path.resolve 'dist'
            [lrSnippet, connect.static(options.base), connect.directory(options.base)]


    # Watch changes and recompile as it is required
    watch:
      #components:
      #  files: ['src/components/**']
      #  tasks: ['copy:debug-components','livereload']
      htmls:
        files: ['src/**/*.html']
        tasks: ['copy:debug-html','htmlmin:dist','cdnify:dist']
      images:
        files: ['src/images/**/*.{png,jpg,jpeg}']
        tasks: ['imagemin']
      styles:
        files: ['src/styles/*.less']
        tasks: ['less:debug','cssmin:dist-lesscss']
      scripts:
        files: ['src/scripts/*.coffee','src/scripts/**/*.coffee']
        tasks: ['coffeelint','coffee:debug','uglify:dist-coffee']
      'scripts-extra':
        files: ['src/scripts/extra/*.js']
        tasks: ['concat:debug-components','uglify:dist-components']
      data:
        files: ['src/data/**/*.md']
        tasks: ['copy:debug-data','m2j:debug','copy:dist-data']
      livereload:
        files: ['debug/index.html','debug/views/*.html'
                'debug/images/**/*.{png,jpg,jpeg}'
                'debug/*.css'
                'debug/*.js'
                'debug/data/**'
                ]
        tasks: ['livereload']

    # Clean of dist, and build
    clean:
      dist: ['dist']
      debug: ['debug']


  # Watch with more beatiful name
  grunt.renameTask 'regarde', 'watch'

  # Default tasks
  grunt.registerTask 'default', ['debug']
  grunt.registerTask 'debug', [
        'coffeelint'             # check js before to continue
        'copy:debug-html'        # html
        'imagemin:debug'         # images
        'less:debug'             # css
        'coffeelint'             # js
        'coffee:debug'
        'copy:debug-data'        # data
        'm2j:debug'              # data
        'concat:debug-components'# extras (libraries)
        'copy:debug-sendphp'     # php script...
        ]
  grunt.registerTask 'dist', [
        'debug'                  # ..prepare compilation
        'htmlmin:dist'           # html
        'cdnify:dist'
        'imagemin:dist'          # images
        'cssmin:dist-lesscss'    # css
        'uglify:dist-coffee'     # js
        'copy:dist-data'         # data 
        'cssmin:dist-components' # extras (libraries)
        'uglify:dist-components'
        'copy:dist-sendphp'      # php script...
        ]
  grunt.registerTask 'all', ['dist'] #['debug','dist']
  
  grunt.registerTask 'server', [
        'debug','livereload-start','connect:livereload','watch']
  grunt.registerTask 'server:dist', [
        'dist','livereload-start','connect:livereload-dist','watch']

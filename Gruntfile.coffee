# = Gruntfile for the compilation of the project
#
# It is based in two compilation folders:
#   build/
#   public/
# and one source folder:
#   src/
#
# 'build/' is a site with all the information required
# to perform a build. 'public/' is a folder that contains
# a standalone version optimised, it is the version to
# install in a webserver.
#
# The compilation process starts always generating the
# 'build/', and once it is generated, an optimisation
# is done to create the 'public/' folder.
#
# Available grunt tasks are:
#
#    build: builds the 'build/' folder
#    public: builds the 'build/' and 'public/' folder
#    clean: removes the 'build/' and 'public/' folders
#    server: build the 'build/' folder, creates a 'livereload'
#            task and watch over the 'src/', and starts a web
#            server on 'build/'
#    server:public: builds the 'public/' folder and creates a web 
#           server on 'public/'

module.exports = (grunt) ->
  # Load grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  # Livereload helpers
  path = require 'path'
  lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
  
  # Project configuration
  grunt.initConfig 
    
    pkg: grunt.file.readJSON 'package.json'

    # = Specific task configurations for 'build/'
    # Compile less files
    #   all less files are compiled into 'build/'
    #   resulting css are compressed later to 'build/'
    less: 
      build:
        files: "build/styles.css": "src/styles/styles.less"
        options:
          paths: ["src/style"]
          #compress:        true#false 
          #yuicompress:     true#false # '<%= app.compress %>'
          #dumpLineNumbers: false#"all" # false
          #optimization:    3 #0     # 3
          compress:        false 
          yuicompress:     false # '<%= app.compress %>'
          dumpLineNumbers: "comments" # false
          optimization:    0     # 3

    # Concatenate and generate javascript from coffeescript tasks
    coffee:
      build:
        options:
          join: true
          sourceMap: true #'<%= !app.compress %>'
        files:
          'build/app.js': ['src/scripts/app.coffee','src/scripts/**/*.coffee']

    concat:
      'build-components':
        files:
          'build/third-party.js': [
            'components/jquery/jquery.js'
            'components/bootstrap/docs/assets/js/bootstrap.js'
            'components/google-code-prettify/src/prettify.js'
            'components/google-code-prettify/src/lang*.js'
            'components/showdown/src/showdown.js'
            'components/showdown/src/extensions/prettify.js'
            'components/angular/angular.js'
            'components/angular-resource/angular-resource.js'
            'components/angular-cookies/angular-cookies.js'
            'components/angular-sanitize/angular-sanitize.js'
            'components/angular-bootstrap/ui-bootstrap-tpls.js'
            'components/angular-strap/dist/angular-strap.js'
            'src/scripts/extra/*.js'
            ]
          'build/third-party.css':
            'components/google-code-prettify/styles/desert.css'

    # = Specific task configurations for 'public/'
    # html: Compile the html files
    htmlmin:
      public:
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
          dest: 'public'
        ]

    # html: Use globals CDN if possible
    cdnify:
      public:
        html: 'public/index.html'
        
    # css: Minimise css
    cssmin:
      'public-lesscss':
        files:
          'public/styles.css': 'build/styles.css'
      'public-components':
        files:
          'public/third-party.css': 'build/third-party.css'

    # = Tasks configurations required for both 'build/' and 'public/'
    # images: Copy and optimize images
    imagemin:
      build:
        options: optimizationLevel: 0
        files: [
          expand: true
          cwd: 'src/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: 'build/images'
        ]
      public:
        options: optimizationLevel: 3
        files: [
          expand: true
          cwd: 'src/images'
          src: '{,*/}*.{png,jpg,jpeg}'
          dest: 'public/images'
        ]

    # Copy components to the build
    copy:
      'build-html': files: [
          # copy views
          expand:true
          cwd: 'src/'
          src: ['*.html', 'views/*.html']
          dest: 'build'
        ]
      'build-data': files: [
          # copy data
          expand:true
          cwd: 'src/'
          src: ['data/*.json','data/**/*.md']
          dest: 'build'
        ]
      'build-fonts-custom': files: [
          # copy fonts
          expand: true
          cwd: 'src/fonts'
          src: ['*']
          dest: 'build/fonts'
        ]
      'build-fonts-awesome': files: [
          # copy awesome fonts
          expand: true
          cwd: 'components/font-awesome/font'
          src: ['*']
          dest: 'build/fonts'
        ]
      'public-data': files: [
          # copy components
          expand:true
          cwd: 'build/'
          src: ['data/*.json','data/**/*.md']
          dest: 'public'
        ]
      'public-fonts': files: [
          # copy fonts
          expand: true
          cwd: 'build/fonts'
          src: ['*']
          dest: 'public/fonts'
        ]  
      'build-sendphp': files: 'build/send.php': 'src/debug-send.php'  
      'public-sendphp': files: 'public/send.php': 'src/send.php'  
      'public-htaccess': files:
        'public/htaccess': 'src/htaccess'  
        'public/.htaccess': 'src/htaccess'  

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
      'public-coffee':
        options: preserveComments: 'some', report: 'min'
        files: 'public/app.js': 'build/app.js'
#      'build-bootstrap':
#        options:
#          compress: false
#          preserveComments: 'all'
#          sourceMap: 'build/components/bootstrap/js/bootstrap.map.js'
#          sourceMappingURL: 'components/bootstrap/js/bootstrap.map.js'
#        files:
#          'build/components/bootstrap/js/bootstrap.js': 'components/bootstrap/js/*.js'
      'public-components':
        options:
          preserveComments: 'some' # 'none'
          report: 'min'
        files:
          'public/third-party.js': 'build/third-party.js'

    # data: markdown 2 json
    m2j:
      'build-resources':
        options: width: 100
        files:
          'build/data/courses.json': ['src/data/courses/*.md']
          'build/data/people.json': ['src/data/people/*.md']
          'build/data/projects.json': ['src/data/projects/*.md']
          'build/data/resources.json': ['src/data/resources/*.md']
        
        
    # Livereload web server
    livereload:
      port: 19001
    connect:
      'livereload':
        options: 
          hostname: '0.0.0.0'
          port: 9001
          middleware: (connect,options) ->
            options.base = path.resolve 'build'
            [lrSnippet, connect.static(options.base), connect.directory(options.base)]
      'livereload-public':
        options: 
          hostname: '0.0.0.0'
          port: 29001
          middleware: (connect,options) ->
            options.base = path.resolve 'public'
            [lrSnippet, connect.static(options.base), connect.directory(options.base)]


    # Watch changes and recompile as it is required
    watch:
      #components:
      #  files: ['components/**']
      #  tasks: ['copy:build-components','livereload']
      htmls:
        files: ['src/**/*.html']
        tasks: ['copy:build-html','htmlmin:public','cdnify:public']
      images:
        files: ['src/images/**/*.{png,jpg,jpeg}']
        tasks: ['imagemin']
      styles:
        files: ['src/styles/*.less']
        tasks: ['less:build']#,'cssmin:public-lesscss']
      scripts:
        files: ['src/scripts/*.coffee','src/scripts/**/*.coffee']
        tasks: ['coffeelint','coffee:build','uglify:public-coffee']
      'scripts-extra':
        files: ['src/scripts/extra/*.js']
        tasks: ['concat:build-components','uglify:public-components']
      data:
        files: ['src/data/**/*.md']
        tasks: ['m2j:build-resources','copy:build-data','copy:public-data']
      'build-sendphp':
        options: livereload: false
        files: ['src/debug-send.php']
        tasks: ['copy:build-sendphp']
      'public-sendphp':
        options: livereload: false
        files: ['src/send.php']
        tasks: ['copy:public-sendphp']
      livereload:
        files: ['build/index.html','build/views/*.html'
                'build/images/**/*.{png,jpg,jpeg}'
                'build/*.css'
                'build/*.js'
                'build/data/**'
                ]
        tasks: ['livereload']

    # Clean of public, and build
    clean:
      public: ['public']
      build: ['build']


  # Watch with more beatiful name
  grunt.renameTask 'regarde', 'watch'

  # Default tasks
  grunt.registerTask 'default', ['build']
  grunt.registerTask 'build', [
        'coffeelint'             # check js before to continue
        'copy:build-html'        # html
        'imagemin:build'         # images
        'less:build'             # css
        'coffeelint'             # js
        'coffee:build'
        'copy:build-data'        # data
        'm2j:build-resources'    # data
        'copy:build-sendphp'
        'concat:build-components'# extras (libraries)
        #'copy:build-fonts-custom'
        'copy:build-fonts-awesome'
        ]
  grunt.registerTask 'public', [
        'build'                  # ..prepare compilation
        'htmlmin:public'           # html
        'cdnify:public'
        'imagemin:public'          # images
        'cssmin:public-lesscss'    # css
        'uglify:public-coffee'     # js
        'copy:public-data'         # data 
        'copy:public-sendphp'
        'cssmin:public-components' # extras (libraries)
        'uglify:public-components'
        'copy:public-fonts'
        'copy:public-htaccess'
        ]
  grunt.registerTask 'all', ['public'] #['build','public']
  
  grunt.registerTask 'server', [
        'build','livereload-start','connect:livereload','watch']
  grunt.registerTask 'server:public', [
        'public','livereload-start','connect:livereload-public','watch']

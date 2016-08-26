module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    # (C) Tasks configurations here
    browserify:
      dev: files: '.tmp/app.js': [ 'src/main.ts' ]
      options:
        watch: true
        browserifyOptions: debug: true
        transform: [
          'yamlify'
          [ 'stringify', 'extensions': [ '.html' ], "minify": true, ]
        ]
        plugin: [ 'tsify' ]
        configure: (b) => 
          b.transform('browserify-ngannotate', x: ['.js','.ts'])
          b.transform('./lib/template-min')

    clean:
      www: files: [ dot: true, src: [ 'www/*','!www/.git' ], ]
      tmp: files: [ dot: true, src: [ '.tmp' ], ]
      inline: files: [ src: [ 'www/*.*.{js,css}' ], ]

    connect:
      options:
        hostname: '0.0.0.0', port: 9302, livereload: 19302
      livereload:	options: base: [ '.tmp','src','.' ]

    copy:
      options: onlyIf: 'modified'
      cname: src: 'src/CNAME', dest: 'www/CNAME'
      favicon: src: 'src/favicon.ico', dest: 'www/favicon.ico'
      nojekyll: src: 'src/.nojekyll', dest: 'www/.nojekyll'
      images:
        expand: true,
        cwd: 'src',
        dest: 'www',
        src: '**/*.{png,gif,jpg,svg}'
      index: src: 'src/index.html', dest: 'www/index.html'
      posts:
        expand: true,
        cwd: 'src',
        dest: 'www',
        src: ['posts/**/*']

    embed: perf: 
      options: threshold: '3000KB'
      files: 'www/index.html':'www/index.html'

    filerev: build: src: 'www/*.{js,css}'

    frontmatter: build:
      options: width: 0
      files: '.tmp/posts.json': ['src/posts/*.md']

    htmlmin:
      www: files: 'www/index.html': 'www/index.html'
      options:
        collapseWhitespace: true
        removeAttributeQuotes: true
        removeComments: true
        sortAttributes: true
        sortClassName: true
        minifyJS: true
        minifyCSS: true

    less: build:
      files: '.tmp/styles.css': ['src/main.less']
      options:
        paths: ['app/', '.']
        plugins: [new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})]
        ieCompat: false
        sourceMap: true
        sourceMapFileInline: true

    replace:
      options: patterns: [
        match: /\$VERSION\$/g, replacement: '<%= pkg.version %>'
      ]
      www: files: [ expand:true, cwd:'.tmp', src:['**/*.js'], dest:'.tmp/' ]

    useminPrepare:
      html: 'src/index.html'
      options: dest: 'www'

    usemin:
      html: [ 'www/index.html' ]
      options: dirs: ['www']

    watch:
      grunt: files: ['Gruntfile.coffee']
      less: files: ['src/**/*.less'], tasks: ['less']
      md: files: ['src/posts/*.md'], tasks: ['frontmatter']

      livereload: 
        options: livereload: '<%= connect.options.livereload %>'
        files: [
          'src/**/*.{md,png,jpg}'
          '.tmp/*'
        ]


  # (L) Load here grunt plugins with tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin'
  })

  # measures the time each task takes
  require('time-grunt')(grunt);

  # (T) Add here your task(s)
  grunt.registerTask 'flag-prod', () => 
    grunt.config.data.browserify.options.browserifyOptions.debug = false;
    grunt.config.data.browserify.options.configure = (b) => 
      b.transform('browserify-ngannotate', x: ['.js','.ts'])
      b.transform('./lib/template-min')
      b.transform({global: true}, 'uglifyify', x: ['.js','.ts','.json'])
      b.plugin('bundle-collapser/plugin')

  grunt.registerTask 'perf-inline', [
    'embed'
  ]

  grunt.registerTask 'build-dev', [ 
    'less'
    'frontmatter'
    'browserify'
  ]

  grunt.registerTask 'build', [ 
    'clean'
    'flag-prod'
    'build-dev'
    'copy'
    'useminPrepare' 
    'concat'
    'uglify'
    'cssmin'
    'filerev'
    'usemin'
    'perf-inline'
    'clean:inline'
    'htmlmin'
  ]

  grunt.registerTask 'serve', [ 
    'build-dev'
    'connect:livereload'
    'watch' 
  ]

  grunt.registerTask 'default', [ 
    'serve' 
  ]

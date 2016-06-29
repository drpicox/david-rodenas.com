Esmoquin = require('esmoquin').Esmoquin

esmoquin = new Esmoquin()
esmoquin.minimatch '/posts/*.md', Esmoquin.local path:'<%= path() %>'
esmoquin.minimatch '/{!posts/}**/*.md', Esmoquin.proxy host:'david-rodenas.com'

module.exports = (grunt) ->

	grunt.initConfig
		pkg: grunt.file.readJSON 'package.json'

		# (C) Tasks configurations here
		autoprefixer:
			options: ['> 5%']
			build: files: [
				expand: true
				cwd: '.tmp/',
				src: '**/*.css',
				dest: '.tmp/'
			]

		clean:
			www: files: [ dot: true, src: [ 'www/*','!www/.git' ], ]
			tmp: files: [ dot: true, src: [ '.tmp' ], ]

		coffee:
			options: join: true, sourceMap: true, 
			scripts: '.tmp/coffees.js': ['app/*/*.coffee']

		connect:
			options:
				hostname: '0.0.0.0', port: 9302, livereload: 19302
				middleware: esmoquin.middleware
			livereload:	options: base: [ '.tmp','app','.' ]

		copy:
			options: onlyIf: 'modified'
			cname: src: 'app/CNAME', dest: 'www/CNAME'
			favicon: src: 'app/favicon.ico', dest: 'www/favicon.ico'
			nojekyll: src: 'app/.nojekyll', dest: 'www/.nojekyll'
			fonts: src: 'bower_components/*/fonts/*', dest: 'www/'
			images:
				expand: true,
				cwd: 'app',
				dest: 'www',
				src: '**/*.{png,gif,jpg,svg}'
			index: src: 'app/index.html', dest: 'www/index.html'
			json:
				expand: true,
				cwd: '.tmp',
				dest: 'www',
				src: '*.json'
			posts:
				expand: true,
				cwd: '.',
				dest: 'www',
				src: ['posts/**/*']

		filerev: build: src: 'www/*.{js,css}'

		frontmatter: build:
			options: width: '2s'
			files: '.tmp/posts.json': ['posts/*.md']

		inline: perf: 
			options: tag: ''
			src: 'www/index.html'
			dist: 'www/index.html'

		jshint:
			options: jshintrc: '.jshintrc'
			build: [ '{app,.tmp}/{*/,}/*.js','!.tmp/concat/*.js' ]

		less: build:
			files: '.tmp/dr-home.css': 'app/dr-home.less'
			options:
				paths: [ 'app/', '.' ]
				compress: false
				yuicompress: false
				dumpLineNumbers: 'comments'
				optimization: 0

		ngtags:
			options: module: 'drHome', autoprefix: false

			scripts:
				src: 'app/{cp,dh}.{components,pages}/*.ngtag'
				dest: '.tmp/ngtags.js'
				options: excludeStyle: true

			styles:
				src: '<%= ngtags.scripts.src %>'
				dest: '.tmp/ngtags.less'
				options: generateStyle: true

		replace:
			options: patterns: [
				match: /\$VERSION\$/g, replacement: '<%= pkg.version %>'
			]
			www: files: [ expand:true, cwd:'.tmp', src:['**/*.js'], dest:'.tmp/' ]

		useminPrepare:
			html: 'app/index.html'
			options: dest: 'www'

		usemin:
			html: [ 'www/index.html' ]
			options: dirs: ['www']

		watch:
			grunt: files: ['Gruntfile.coffee']
			coffee: files: ['app/{*/,}*.coffee'], tasks: ['coffee']
			js: files: ['app/{*/,}*.js'], tasks: ['jshint']
			less: files: ['app/{*/,}*.less'], tasks: ['less','autoprefixer']
			md: files: ['posts/{*/,}*.md'], tasks: ['frontmatter']
			ngtags: files: ['<%= ngtags.scripts.src %>'], tasks: ['ngtags','jshint','less','autoprefixer']

			livereload: 
				options: livereload: '<%= connect.options.livereload %>'
				files: [
					'{app,.tmp,posts}/{*/,}*.{html,js,css,json,md,png}'
				]


	# (L) Load here grunt plugins with tasks
	require('jit-grunt')(grunt, {
		ngtemplates: 'grunt-angular-templates'
		useminPrepare: 'grunt-usemin'
	})

	# measures the time each task takes
	require('time-grunt')(grunt);

	# custom tags
	grunt.registerTask 'pref-posts-json-script', () ->
		posts = require('./.tmp/posts.json')
		text = 'window.postsJson=' + JSON.stringify(posts) + ';'
		grunt.file.write('.tmp/posts.json.js', text)

	grunt.registerTask 'perf-inline', [
		'inline'
	]

	# (T) Add here your task(s)
	grunt.registerTask 'build-dev', [ 
		'ngtags'
		'jshint'
		'coffee'
		'less'
		'autoprefixer'
		'frontmatter'
	]

	grunt.registerTask 'build', [ 
		'clean'
    	'build-dev'
    	'pref-posts-json-script'
    	'copy'
    	'useminPrepare' 
    	'concat'
    	'replace'
    	'uglify'
    	'cssmin'
    	'filerev'
    	'usemin'
    	'perf-inline'
    ]

	grunt.registerTask 'serve', [ 
		'build-dev'
		'connect:livereload'
		'watch' 
	]

	grunt.registerTask 'default', [ 
		'serve' 
	]
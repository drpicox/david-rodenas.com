Esmoquin = require('esmoquin').Esmoquin

esmoquin = new Esmoquin()
esmoquin.minimatch '**/*.md', Esmoquin.proxy host:'david-rodenas.com'

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
			www: files: [ dot: true, src: [ 'dist/*','!dist/.git' ], ]
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
			cname: src: 'app/CNAME', dest: 'dist/CNAME'
			fonts: src: 'bower_components/*/fonts/*', dest: 'dist/'
			images:
				expand: true,
				cwd: 'app',
				dest: 'dist',
				src: '**/*.{png,gif,jpg,svg}'
			index: src: 'app/index.html', dest: 'dist/index.html'
			json:
				expand: true,
				cwd: '.tmp',
				dest: 'dist',
				src: '*.json'
			posts:
				expand: true,
				cwd: '.',
				dest: 'dist',
				src: ['posts/**/*']

		filerev: build: src: 'dist/*.{js,css}'

		frontmatter: build:
			options: width: '2s'
			files: '.tmp/posts.json': ['posts/*.ymd']

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

		useminPrepare:
			html: 'app/index.html'
			options: dest: 'dist'

		usemin:
			html: [ 'dist/index.html' ]
			options: dirs: ['dist']

		watch:
			grunt: files: ['Gruntfile.coffee']
			coffee: files: ['app/{*/,}*.coffee'], tasks: ['coffee']
			js: files: ['app/{*/,}*.js'], tasks: ['jshint']
			less: files: ['app/{*/,}*.less'], tasks: ['less','autoprefixer']
			md: files: ['posts/{*/,}*.ymd'], tasks: ['frontmatter']
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
    	'copy'
    	'useminPrepare' 
    	'concat'
    	'uglify'
    	'cssmin'
    	'filerev'
    	'usemin'
    ]

	grunt.registerTask 'serve', [ 
		'build-dev'
		'connect:livereload'
		'watch' 
	]

	grunt.registerTask 'default', [ 
		'serve' 
	]
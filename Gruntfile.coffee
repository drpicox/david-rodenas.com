module.exports = (grunt) ->

	grunt.initConfig
		pkg: grunt.file.readJSON 'package.json'

		# (C) Tasks configurations here
		browserify:
			dev: files: '.tmp/app.js': [ '.tmp/rollup.js' ]
			options: 
				watch: true
				browserifyOptions: debug: true
				transform: [
					#[ 'stringify', 'extensions': [ '.html' ], "minify": true, ]
					'envify'
				]

		clean:
			www: files: [ dot: true, src: [ 'www/*','!www/.git' ], ]
			tmp: files: [ dot: true, src: [ '.tmp' ], ]

		connect:
			options:
				hostname: '0.0.0.0', port: 9302, livereload: 19302
			livereload:	options: base: [ '.tmp','src','.' ]

		copy:
			options: onlyIf: 'modified'
			cname: src: 'app/CNAME', dest: 'www/CNAME'
			favicon: src: 'app/favicon.ico', dest: 'www/favicon.ico'
			nojekyll: src: 'app/.nojekyll', dest: 'www/.nojekyll'
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
				cwd: 'src/posts',
				dest: 'www',
				src: ['posts/**/*']

		filerev: build: src: 'www/*.{js,css}'

		frontmatter: build:
			options: width: '2s'
			files: '.tmp/posts.json': ['src/posts/*.md']

		embed: perf: 
			options: threshold: '3000KB'
			files: 'www/index.html':'www/index.html'

		less: build:
			files: '.tmp/styles.css': ['src/main.less']
			options:
				paths: ['app/', '.']
				plugins: [new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})]
				ieCompat: false
				sourceMap: true
				sourceMapFileInline: true

		ngAnnotate: build:
			files: '.tmp/app.js': '.tmp/app.js'

		replace:
			options: patterns: [
				match: /\$VERSION\$/g, replacement: '<%= pkg.version %>'
			]
			www: files: [ expand:true, cwd:'.tmp', src:['**/*.js'], dest:'.tmp/' ]

		rollup:
			files: dest:'.tmp/rollup.js', src:'src/main.ts'
			options: 
				sourceMap: 'inline'
				plugins: [                     
                    require('rollup-plugin-string')(include: '**/*.tpl.html')
                    require('rollup-plugin-typescript')()
                    require('rollup-plugin-browserify-transform')(require('stringify'), 'extensions': [ '.html' ], "minify": true,)
                ]

		useminPrepare:
			html: 'app/index.html'
			options: dest: 'www'

		usemin:
			html: [ 'www/index.html' ]
			options: dirs: ['www']

		watch:
			grunt: files: ['Gruntfile.coffee']
			less: files: ['src/**/*.less'], tasks: ['less']
			md: files: ['src/posts/*.md'], tasks: ['frontmatter']
			rollup: files: ['src/**/*.ts'], tasks: ['rollup']

			livereload: 
				options: livereload: '<%= connect.options.livereload %>'
				files: [
					'{src,.tmp}/**/*.{html,js,css,json,md,png}'
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
		grunt.config.data.browserify.options.transform.push(
			'browserify-ngannotate',
			'uglifyify'
		)

	grunt.registerTask 'perf-inline', [
		'embed'
	]

	grunt.registerTask 'build-dev', [ 
		'less'
		'frontmatter'
		'rollup'
		'browserify'
		#'autoprefixer'
		#'frontmatter'
	]

	grunt.registerTask 'build', [ 
		'clean'
		'flag-prod'
    	'build-dev'
    	'ngAnnotate'
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
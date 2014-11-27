/*
 Watches for changes 
 this is the basic for livereload
*/
module.exports = {
	less: {
		files: ['src/*/styles/{,*/}*.less'],
		tasks: ['less','autoprefixer']
	},
	css: {
		files: ['src/*/styles/{,*/}*.css'],
		tasks: ['copy:styles','autoprefixer']
	},
	images: {
		files: ['src/*/images/{,*/}*'],
	},
	scripts: {
		files: ['src/{,*/,*/*/}*.js'],
		tasks: ['jshint'],
	},
	stub: {
		files: ['src/stub/{,*/}*'],
	},
	views: {
		files: ['src/views/{,*/}*'],
	},
	livereload: {
		options: {
			livereload: '<%= connect.options.livereload %>',
		},
		files: [
			'src/*/assets/{,*/}*',
			'src/*/resources/{,*/}*',
			'src/*/images/{,*/}*',
			'src/*/views/{,*/}*',
			'src/*/styles/{,*/}*',
			'src/{,*/,*/*/}*.js',
			'src/{,*/,*/*/}*.html',
			'.tmp/{,*/,*/*/}*',
		],
	}
};
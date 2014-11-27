/* Creates a webserver */
module.exports = {
	options: {
		port: 9645,
	    livereload: 19645,
		hostname: '0.0.0.0',
		open: 'http://localhost:<%= connect.options.port %>',
	},
	livereload: {
		options: {
			base: [
				'www','.tmp','src','.'
			],
		}
	},
	dist: {
		options: {
			base: 'www'
		}
	}
};
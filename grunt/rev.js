/* adds a hash to file names so avoids browser cache when there are updates */
module.exports = {
	dist: {
		files: {
			src: [
				'www/**/*.css',
				'www/**/*.js',
			]
		}
	}
};
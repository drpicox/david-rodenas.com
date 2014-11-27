/* generate a js file with all templates inside and optimize by preloading */
module.exports = {
	rt: {
		cwd: 'src',
		src: [ '*/**/*.html' ],
		dest: 'www/dh-views.js',
		options: {
			module: 'com.david-rodenas.dh',
		},
	},
};
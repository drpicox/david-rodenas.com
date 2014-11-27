/* autoprefixer adds vendor prefixes to css classes automatically,
 * so we write for example: transition: transform 1s, and -webkit- 
 * is automatically generated
 */
module.exports =  {
	options: ['last 2 version', '> 1%', 'ie 8', 'ie 7'],
	all: {
		files: [{
			expand: true,
			cwd: '.tmp/',
			src: '**/*.css',
			dest: '.tmp/'
		}]
	},
};
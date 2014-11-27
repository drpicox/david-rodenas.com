/* clean production generated files and temporary files */
module.exports = {
	www: {
		files: [{
			dot: true,
			src: [ 'www/*','!www/.git' ],
		}]
	},
	tmp: {
		files: [{
			dot: true,
			src: [ '.tmp/' ],
		}]
	},
};
/* transforms index.html to compress all dependences in few files. */
module.exports = {
	html: [ 'www/index.html' ],
	//html: ['www/{,*/}*.html'],
	//css: ['www/css/{,*/}*.css'],
	options: {
		dirs: ['www']
	}
};
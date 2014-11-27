/* 
 prepares to process index.html file and configures grunt tasks
 it looks for comments like  <!-- build:XX(pwd) fitxer.XX -->
 it requires to execute after this 'concat', 'cssmin', 'uglify'
*/
module.exports = {
	html: 'src/index.html',
	options: {
		dest: 'www'
	}
};
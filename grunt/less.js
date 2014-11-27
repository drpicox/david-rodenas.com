/* Generates .css files from less */
module.exports = {
	build: {
		files: {
			'.tmp/dh/styles/DhStyles.css': 'src/dh/styles/DhStyles.less'
		},
		options: {
			paths: [ 'src/', '.' ],
			compress: false,
			yuicompress: false,
			dumpLineNumbers: 'comments',
			optimization: 0,
		},
	},
};
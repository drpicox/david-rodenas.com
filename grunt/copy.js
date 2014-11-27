module.exports = {
	options: {
		onlyIf: 'modified'
	},
	fonts: {
		src: 'bower_components/*/fonts/*',
		dest: '<%= config.dist %>/'
	},
	images: {
		expand: true,
		cwd: '<%= config.src %>',
		dest: '<%= config.dist %>',
		src: '**/*.{png,gif,jpg}'
	},
	svg: {
		expand: true,
		cwd: '<%= config.src %>',
		dest: '<%= config.dist %>',
		src: '**/*.svg'
	},
	index: {
		src: '<%= config.src %>/index.html',
		dest: '<%= config.dist %>/index.html'
	},
	cname: {
		src: '<%= config.src %>/CNAME',
		dest: '<%= config.dist %>/CNAME'
	}
};

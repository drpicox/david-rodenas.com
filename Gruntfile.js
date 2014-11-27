'use strict';

module.exports = function(grunt) {

	// measures the time each task takes
	require('time-grunt')(grunt);

	// load grunt config
	// - loads a configuration for each grunt/*.js
	// - loads user tasks from grunt/aliases.yaml
	// - loads grunt tasks under demand using jit-grunt
	require('load-grunt-config')(grunt, {jitGrunt: true});

	// load non-standarized named tasks
	grunt.loadNpmTasks('grunt-usemin');
	grunt.loadNpmTasks('grunt-angular-templates');
};
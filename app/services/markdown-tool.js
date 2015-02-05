/*
	markdownTool:
		-html(md): html
		-text(md): text

*/
/* global marked: false */
/* global hljs: false */
;(function(angular) {
	'use strict';

	angular
		.module('drHome')
		.factory('markdownTool', markdownToolFactory);

	function markdownToolFactory  () {
		var tool = {
			html: html,		// (md)
			text: text,		// (md)
		};

		function html(body) {
			body = stripYaml(body);
			body = marked(body);
			return body;
		}

		function text(body) {
			var div = angular.element('<div>');
			body = tool.html(body);
			div.html(body);
			body = div.text();
			return body;
		}

		function stripYaml(body) {
			return body.replace(/^---(.|\n)+---\n/, '');
		}

		return tool;
	}

	marked.setOptions({
		highlight: function(code, lang) {
			return hljs.highlight(lang, code).value;
		},
	});

})(angular);
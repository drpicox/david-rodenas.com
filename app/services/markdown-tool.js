/*
	markdownTool:
		-element(md): jqLite element
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
			element:element,	// (md)
			html:html,			// (md)
			text: text,			// (md)
		};

		function element(body) {
			body = stripYaml(body);
			body = marked(body);

			var div = angular.element('<div>');
			div.html(body);
			angular.forEach(div[0].querySelectorAll('a[href^=http]'), function(a) {
				a.setAttribute('target','_blank');
			});

			return div;
		}

		function html(body) {
			var element = tool.element(body);
			body = element.html();
			return body;
		}

		function text(body) {
			var div = tool.element(body);
			body = div.text();
			return body;
		}

		function stripYaml(body) {
			var end = 0;
			body = body.split('\n');
			if (body[0] === '---') {
				end++;
			}
			while (body[end] !== '---' && body[end] !== body[-1]) {
				end++;
			}

			body = body.slice(end+1).join('\n');
			return body;
		}

		return tool;
	}

	marked.setOptions({
		highlight: function(code, lang) {
			if (lang) {
				return hljs.highlight(lang, code).value;
			} else {
				return hljs.highlightAuto(code).value;
			}
		},
		sanitize: false,
	});

})(angular);
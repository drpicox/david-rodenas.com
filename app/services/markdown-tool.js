/*
	markdownTool:
		-element(md): jqLite element
		-html(md): html
		-text(md): text

*/
/* global marked: false */
/* global Prism: false */
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
			angular.forEach(div[0].querySelectorAll('code[class^=lang-]'), function(code) {
				code.className = 'language-' + code.className.slice(5);
			});
			angular.forEach(div[0].querySelectorAll('img'), function(img) {
				img.setAttribute('class','img-responsive');
				img.parentElement.setAttribute('class','img-container');
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
			var lines = body.split('\n');

			var end = 0;
			if (lines[0] === '---') {
				end = 1;
				while (lines[end] !== '---' && lines[end] !== lines[-1]) {
					end++;
				}
				body = lines.slice(end+1).join('\n');
			}

			return body;
		}

		return tool;
	}

	marked.setOptions({
		highlight: function(code, lang) {
			if (lang) {
				if (lang === 'xml' || lang === 'html') { lang = 'markup'; }
				code = '<code class="language-'+lang+'">'+escapeHtml(code)+'</code>';
				code = angular.element(code);
				Prism.highlightElement(code[0]);
				return code.html();
			} else {
				return lang;
			}
		},
		sanitize: false,
	});

	function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, '&amp;')
         .replace(/</g, '&lt;')
         .replace(/>/g, '&gt;')
         .replace(/"/g, '&quot;')
         .replace(/'/g, '&#039;');
 	}

})(angular);
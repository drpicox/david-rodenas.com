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
			var div = angular.element('<div>');
			var lines = body.split('\n');
			lines = stripYaml(lines);

			var ii, i = 0, l = lines.length, elem;
			while (i < l) {
				ii = i;
				i = skipMarkdown(i, l, lines);
				if (ii !== i) {
					body = lines.slice(ii, i).join('\n');
					elem = elementMarkdown(body);
					div.html(div.html() + elem.html());
				}
				ii = i;
				i = skipAngular(i, l, lines);
				if (ii !== i) {
					body = lines.slice(ii, i).join('\n');
					elem = elementAngular(body);
					div.html(div.html() + elem.html());
				}
			}

			return div;
		}

		function elementMarkdown(body) {
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

		function elementAngular(body) {
			var div = angular.element('<div>');
			div.html(body);
			
			angular.forEach(div[0].querySelectorAll('[markdown="1"]'), function(dom) {
				var body = dom.innerHTML;
				var elem = element(body);
				dom.innerHTML = elem.html();
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

		var tagRe = /^<[\w:-]+/;
		var tagEndRe = /^<\/[\w:-]+/;

		function skipMarkdown(i, l, lines) {
			var code = false, line;

			while (i < l) {
				line = lines[i];
				if (code) {
					if (line[0] === '`' && line[1] === '`' && line[2] === '`' ) {
						code = false;
					}
				} else {
					if (line[0] === '`' && line[1] === '`' && line[2] === '`' ) {
						code = true;
					} else if (line[0] === '<' && line.match(tagRe)) {
						break;
					}
				}
				i++;
			}

			return i;
		}

		function skipAngular(i, l, lines) {
			var line;

			while (i < l) {
				line = lines[i];
				if (line[0] === '<' && line[1] === '/' && line.match(tagEndRe)) {
					break;
				}
				i++;
			}

			return i;
		}

		function stripYaml(lines) {
			var end = 0;
			if (lines[0] === '---') {
				end = 1;
				while (lines[end] !== '---' && lines[end] !== lines[-1]) {
					end++;
				}
				lines = lines.slice(end+1);
			}

			return lines;
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
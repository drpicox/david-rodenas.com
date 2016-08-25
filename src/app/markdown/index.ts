import { BindMarkdownDirective } from './bind-markdown.directive';
import { MarkdownService } from './markdown.service';

export const MarkdownModule = angular
	.module('MarkdownModule', [])
    .directive('appBindMarkdown', BindMarkdownDirective)
    .service('markdownService', MarkdownService)
    .name;
